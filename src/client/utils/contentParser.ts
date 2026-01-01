import { ParsedContent } from "../types/chat";

/**
 * Parses message content to extract thinking blocks, tool calls, and regular content
 * Handles both complete and incomplete (streaming) tags
 */
export function parseContent(content: string): ParsedContent {
  const thinkingBlocks: string[] = [];
  const toolCalls: Array<{ name: string; args: string }> = [];

  // Extract complete <think>...</think> pairs
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  let match;
  while ((match = thinkRegex.exec(content)) !== null) {
    thinkingBlocks.push(match[1].trim());
  }

  // Extract tool calls from content (format: <tool_call>name: args</tool_call>)
  const toolCallRegex = /<tool_call>([\s\S]*?)<\/tool_call>/g;
  while ((match = toolCallRegex.exec(content)) !== null) {
    const toolContent = match[1].trim();
    const colonIndex = toolContent.indexOf(":");
    if (colonIndex !== -1) {
      toolCalls.push({
        name: toolContent.substring(0, colonIndex).trim(),
        args: toolContent.substring(colonIndex + 1).trim(),
      });
    } else {
      toolCalls.push({
        name: toolContent,
        args: "",
      });
    }
  }

  // Remove all complete thinking tags and tool call tags to get regular content
  let regular = content.replace(/<think>[\s\S]*?<\/think>/g, "");
  regular = regular.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "");

  // Check for incomplete tags (opening tag without closing tag) during streaming
  const hasIncompleteThink = /<think>(?![\s\S]*?<\/think>)/.test(regular);
  const hasIncompleteToolCall = /<tool_call>(?![\s\S]*?<\/tool_call>)/.test(
    regular
  );
  const hasIncompleteTags = hasIncompleteThink || hasIncompleteToolCall;

  // If there are incomplete tags, extract the incomplete thinking/tool content
  if (hasIncompleteThink) {
    const incompleteMatch = regular.match(/<think>([\s\S]*)$/);
    if (incompleteMatch) {
      // Add it as a streaming thinking block
      thinkingBlocks.push(incompleteMatch[1].trim() + "...");
      // Remove the incomplete tag and its content from regular
      regular = regular.replace(/<think>[\s\S]*$/, "");
    }
  }

  if (hasIncompleteToolCall) {
    const incompleteMatch = regular.match(/<tool_call>([\s\S]*)$/);
    if (incompleteMatch) {
      const toolContent = incompleteMatch[1].trim();
      const colonIndex = toolContent.indexOf(":");
      if (colonIndex !== -1) {
        toolCalls.push({
          name: toolContent.substring(0, colonIndex).trim(),
          args: toolContent.substring(colonIndex + 1).trim() + "...",
        });
      } else {
        toolCalls.push({
          name: toolContent || "loading...",
          args: "",
        });
      }
      // Remove the incomplete tag and its content from regular
      regular = regular.replace(/<tool_call>[\s\S]*$/, "");
    }
  }

  // Clean up any remaining orphaned tags
  regular = regular.replace(/<\/?think>/g, "");
  regular = regular.replace(/<\/?tool_call>/g, "");

  return {
    thinking: thinkingBlocks,
    toolCalls,
    regular: regular.trim(),
    hasIncompleteTags,
  };
}
