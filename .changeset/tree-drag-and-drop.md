---
"@pro/tree": minor
---

feat(tree): add drag-and-drop data layer with undo/redo and constraints

- New props: draggable, allowDrag, allowDrop, maxDepth, onDragConfirm (async with rollback), maxHistory
- Snapshot-based undo/redo exposed via undo()/redo()/canUndo/canRedo
- Drag handle icon visible on node hover
- Pure tree data utility functions exported: cloneTree, findNode, removeNode, insertNode
