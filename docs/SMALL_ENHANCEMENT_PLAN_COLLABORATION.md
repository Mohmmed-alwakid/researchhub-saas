# Small Enhancement Plan: Real-time Collaboration

## Enhancement Overview

Add minimal real-time features to the existing StudyCreationWizard without changing the core design.

## Changes Required

### 1. Add Real-time Presence Indicator

```tsx
// src/client/components/study-builder/components/CollaboratorPresence.tsx
export const CollaboratorPresence: React.FC<{ studyId: string }> = ({ studyId }) => {
  const [activeUsers, setActiveUsers] = useState<Array<{ id: string; name: string; avatar: string }>>([]);

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      {activeUsers.length > 0 && (
        <>
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 3).map((user) => (
              <img
                key={user.id}
                className="w-6 h-6 rounded-full border-2 border-white"
                src={user.avatar}
                alt={user.name}
                title={user.name}
              />
            ))}
            {activeUsers.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs">
                +{activeUsers.length - 3}
              </div>
            )}
          </div>
          <span>{activeUsers.length} online</span>
        </>
      )}
    </div>
  );
};
```

### 2. Add to StudyCreationWizard Header

```tsx
// In StudyCreationWizard.tsx header section
<div className="flex items-center space-x-3">
  {/* Auto-save status */}
  <div className="flex items-center space-x-2 text-sm">
    {/* ... existing auto-save code ... */}
  </div>
  
  {/* NEW: Collaborator presence */}
  <CollaboratorPresence studyId={formData.id} />
  
  {/* Help and support */}
  <button className="text-gray-400 hover:text-gray-600">
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  </button>
</div>
```

### 3. Add Live Comments Sidebar (Optional)

```tsx
// src/client/components/study-builder/components/LiveComments.tsx
export const LiveComments: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Comments</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* Comments list */}
        <div className="space-y-4">
          <div className="text-sm text-gray-500 text-center">
            No comments yet. Add the first comment!
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
          rows={3}
          placeholder="Add a comment..."
        />
        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
          Add Comment
        </button>
      </div>
    </div>
  );
};
```

## Benefits

- ✅ No changes to existing wizard flow
- ✅ Adds professional collaboration features
- ✅ Optional features that don't disrupt current users
- ✅ Minimal code additions (< 150 lines total)
- ✅ Maintains existing design system and patterns
