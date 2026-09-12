# OpenAI ↔ Figma integration

## Source of truth
The two supplied CrypInvest reference images remain the visual source of truth for the implementation. The web app is the production implementation; Figma is the editable design/handoff layer.

## Official integration
OpenAI and Figma support a code-to-design workflow through the Figma MCP Server. The supported workflow can move implementation context from code into editable Figma designs and bring Figma design context back into code.

Official references:
- https://openai.com/index/figma-partnership/
- https://openai.com/business/plugins/figma/

## Current project status
- Design reference images are stored in `design-reference/`.
- UI source-of-truth notes are stored in `design-reference/UI-SOURCE-OF-TRUTH.md`.
- The project is prepared for Figma/Codex round-trip handoff.
- No Figma file key or personal Figma credential is stored in this repository.

## Important
A live Figma file cannot be linked or modified from this repository without an authenticated Figma file/workspace connection. The safe behavior is to keep credentials out of the codebase and connect the actual Figma file through the user's authenticated Figma/Codex environment.
