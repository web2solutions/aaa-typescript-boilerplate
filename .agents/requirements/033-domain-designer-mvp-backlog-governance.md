# Requirement 033 - Domain Designer MVP Backlog Governance

## Context
Domain Designer is now an active product surface inside the repository and must follow explicit backlog governance.

## Rules
1. Every new Domain Designer MVP idea must be registered in `.agents/project-todos.md` under:
   - `Domain Designer MVP Backlog / Open`, or
   - `Domain Designer MVP Backlog / Done`
2. Completed MVP items must be moved from `Open` to `Done` in the same change set when possible.
3. When implementation is paused by explicit user instruction, backlog capture still remains mandatory.
4. Documentation updates remain mandatory for each delivered Domain Designer feature.

## Implementation Notes
- Backlog tracking is part of delivery quality, not optional project metadata.
- The backlog is the source of truth for sequencing MVP work before larger feature phases.
