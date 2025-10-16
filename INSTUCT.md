# WhatsApp-like Chat Application

A comprehensive real-time messaging application that replicates the core WhatsApp experience with modern web technologies.

**Experience Qualities**:
1. **Intuitive** - Users should immediately understand how to navigate and use all features without learning
2. **Responsive** - Every interaction feels instant and smooth across all device sizes
3. **Familiar** - Interface patterns match WhatsApp conventions for zero friction adoption

**Complexity Level**: Complex Application (advanced functionality, accounts)
This is a full-featured messaging platform requiring sophisticated state management, real-time updates, media handling, and comprehensive user interactions. Note: This implementation is frontend-only for now; simulate backend interactions using mock data, local storage, or in-memory stores (e.g., for user accounts, message history, and real-time updates via simulated WebSockets or polling).

## Tech Stack Recommendations
- **Frontend Framework**: Next.js with TypeScript for server-side rendering, routing, and optimized performance.
- **UI Components**: shadcn/ui for customizable, accessible components that integrate seamlessly with Tailwind CSS.
- **State Management**: Zustand for lightweight, efficient global and local state handling (e.g., for chat lists, messages, and user presence).
- **Styling**: Tailwind CSS to implement the custom color palette and responsive layouts.
- **Virtualization**: react-virtuoso for efficient rendering of long chat histories; it's highly versatile for chat apps, supporting variable item heights, reversed lists (bottom-aligned for new messages), infinite scrolling, and smooth performance with large datasets.
- **Other Tools**: Emoji-mart for emoji picker, React-dropzone for media uploads, date-fns for timestamp formatting. Use local storage or IndexedDB for persisting mock data across sessions.

## Essential Features

**Chat List Management**
- Functionality: Display all conversations with latest message preview, timestamps, and unread counts
- Purpose: Quick access to all conversations and overview of activity
- Trigger: App launch or navigation to main screen
- Progression: Load conversations → Display sorted by recency → Show unread indicators → Enable search/filter
- Success criteria: All chats load within 500ms, accurate unread counts, smooth scrolling (leveraging react-virtuoso for virtualization)

**Real-time Messaging**
- Functionality: Send/receive text messages, emojis, with delivery status indicators
- Purpose: Core communication functionality with visual feedback
- Trigger: User types message and presses send or Enter
- Progression: Type message → Send → Show sending status → Confirm delivery → Display in chat
- Success criteria: Messages appear instantly, status updates are accurate, no message loss

**Media Sharing**
- Functionality: Share images with preview, thumbnail generation
- Purpose: Rich communication beyond text
- Trigger: User clicks attachment button and selects media
- Progression: Select media → Preview with caption option → Send → Display with loading states
- Success criteria: Images load quickly, thumbnails are crisp, captions save correctly

**Message Status System**
- Functionality: Visual indicators for sent, delivered, and read status
- Purpose: Communication transparency and user confidence
- Trigger: Automatic based on message lifecycle
- Progression: Send (clock) → Delivered (single check) → Read (double blue checks)
- Success criteria: Status updates in real-time, visually distinct states

**Contact Management**
- Functionality: Add new contacts, search existing contacts, initiate conversations
- Purpose: User discovery and conversation initiation
- Trigger: Plus button or search in contacts
- Progression: Search/browse contacts → Select contact → Start new chat → Send first message
- Success criteria: Fast contact search, immediate chat creation

**Message Search & History**
- Functionality: Search across all messages and conversations
- Purpose: Quick information retrieval from chat history
- Trigger: Search bar activation
- Progression: Enter search term → Real-time filtering → Highlight matches → Jump to message
- Success criteria: Sub-second search results, accurate highlighting

## Edge Case Handling

- **Network Issues**: Graceful offline handling with message queuing and retry mechanisms
- **Large Media Files**: Compression and progressive loading for images over 5MB
- **Empty States**: Onboarding guidance for new users with no conversations
- **Long Messages**: Text wrapping and expansion for messages over 500 characters
- **Rapid Messaging**: Message batching and debouncing for users sending multiple quick messages
- **Screen Rotation**: Layout adaptation maintaining scroll position and input focus

## Design Direction

The design should feel modern, clean, and instantly familiar to WhatsApp users while incorporating subtle enhancements that leverage web capabilities. Rich interface with purposeful animations and micro-interactions that enhance usability.

## Color Selection

Custom palette inspired by WhatsApp's signature green with enhanced contrast and accessibility.

- **Primary Color**: Deep WhatsApp Green (oklch(0.45 0.15 145)) - Communicates trust and familiarity
- **Secondary Colors**: Light green tint (oklch(0.95 0.05 145)) for message bubbles and subtle highlights
- **Accent Color**: Vibrant Green (oklch(0.55 0.18 145)) - For active states, online indicators, and CTAs
- **Foreground/Background Pairings**:
  - Background (Light Gray oklch(0.98 0.01 0)): Dark text (oklch(0.15 0.01 0)) - Ratio 5.2:1 ✓
  - Primary (Deep Green oklch(0.45 0.15 145)): White text (oklch(1 0 0)) - Ratio 6.8:1 ✓
  - Message bubbles (Light Green oklch(0.95 0.05 145)): Dark text (oklch(0.15 0.01 0)) - Ratio 5.1:1 ✓
  - Accent (Vibrant Green oklch(0.55 0.18 145)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓

## Font Selection

Typography should convey clarity and readability while supporting multiple languages and emoji. Inter for its excellent legibility and comprehensive character support.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold / 24px / letter-spacing: -0.02em
  - Contact Names: Inter Medium / 16px / letter-spacing: 0
  - Message Text: Inter Regular / 15px / line-height: 1.4
  - Timestamps: Inter Regular / 12px / color: muted (e.g., oklch(0.6 0.01 0))
  - Status Text: Inter Regular / 11px / subtle styling (e.g., italic, opacity: 0.7)

## Animations

Subtle functionality-focused animations that provide feedback and maintain context during transitions, with moments of delight in message sending and status updates.

- **Purposeful Meaning**: Animations should communicate state changes (message sending, typing indicators) and provide spatial continuity during navigation
- **Hierarchy of Movement**: Message send animations take priority, followed by typing indicators, then navigation transitions

## Component Selection

- **Components**:
  - Sidebar for chat list with custom contact cards
  - Drawer for mobile navigation
  - ScrollArea for message history with infinite scroll (integrated with react-virtuoso for virtualization)
  - Input with custom emoji picker integration
  - Avatar with online status indicators
  - Dialog for contact selection and settings
  - Popover for message context menus
  - Badge for unread message counts

- **Customizations**:
  - Custom message bubble component with tail styling
  - Image gallery component with modal preview
  - Typing indicator with animated dots
  - Message status icons (checkmarks, clock)
  - Custom search bar with recent searches

- **States**:
  - Messages: sending (gray), sent (single check), delivered (double check), read (blue checks)
  - Contacts: online/offline indicators with green dots
  - Input: typing states with character counts
  - Buttons: hover states with subtle elevation changes

- **Icon Selection**: Phosphor icons for consistency - PaperPlane (send), MagnifyingGlass (search), Plus (new chat), Phone (calls), VideoCamera (video calls)

- **Spacing**:
  - Message padding: 12px horizontal, 8px vertical
  - Chat list items: 16px all around
  - Component gaps: 8px between related elements, 24px between sections

- **Mobile**:
  - Single-column layout with full-width chat view
  - Bottom navigation for key actions
  - Swipe gestures for message actions and navigation
  - Adaptive text sizes and touch targets (minimum 44px)
  - Collapsible chat list that slides away during active conversations
