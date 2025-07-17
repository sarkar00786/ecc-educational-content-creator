# Tier System Documentation

## Overview
The Tier system provides a user-friendly way for all users to select their account tier (Advanced or PRO) and easily upgrade/downgrade as needed. This system is complementary to the existing Admin tag system and provides a seamless tier management experience.

## Components

### 1. TierBadge Component
**Location**: `src/components/common/TierBadge.jsx`

A reusable badge component that displays tier information with customizable styling and interactivity.

**Props**:
- `tier`: 'Advanced' or 'PRO' (default: 'Advanced')
- `size`: 'xs', 'sm', 'md', 'lg' (default: 'sm')
- `className`: Additional CSS classes
- `position`: 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'inline' (default: 'inline')
- `showIcon`: boolean to show/hide tier icon (default: true)
- `interactive`: boolean to enable click interactions (default: false)
- `onClick`: callback function for click events

**Features**:
- Responsive design with multiple size options
- Tier-specific colors and icons (Shield for Advanced, Crown for PRO)
- Keyboard navigation support
- Hover effects for interactive mode

### 2. TierSelector Component
**Location**: `src/components/common/TierSelector.jsx`

A selection component that allows users to choose between Advanced and PRO tiers.

**Props**:
- `onTierChange`: callback function called when tier changes

**Features**:
- Automatically loads current tier from localStorage
- Visual feedback for selected tier (ring highlight)
- Updates userTierManager when tier changes

### 3. TierStatusIndicator Component
**Location**: `src/components/common/TierStatusIndicator.jsx`

A comprehensive status display that shows current tier information with upgrade options.

**Props**:
- `showUpgradePrompt`: boolean to show upgrade button (default: true)
- `onUpgrade`: callback function for upgrade actions

**Features**:
- Displays current tier with badge and description
- Shows tier pricing information
- Upgrade button for Advanced users
- Feature summary for current tier

## Integration Points

### 1. Header Component
**Location**: `src/components/layout/Header.jsx`

The TierSelector is integrated into the header, allowing users to switch tiers directly from the main navigation.

**Features**:
- Positioned between theme toggle and admin badge
- Persists tier selection to localStorage
- Available to all users (not just admins)

### 2. User Profile Dropdown
**Location**: `src/components/layout/UserProfileDropdown.jsx`

The TierStatusIndicator is added to the user profile dropdown for quick tier overview.

**Features**:
- Shows current tier status
- Includes upgrade prompt for Advanced users
- Compact display suitable for dropdown

### 3. My Profile Page
**Location**: `src/components/settings/MyProfilePage.jsx`

A dedicated "Account Tier" section in the profile settings page.

**Features**:
- Full tier status with upgrade options
- Integrated with existing profile management
- Consistent styling with other profile sections

## Usage Examples

### Basic Tier Badge
```jsx
import TierBadge from './components/common/TierBadge';

// Simple display badge
<TierBadge tier="PRO" size="sm" />

// Interactive badge with callback
<TierBadge 
  tier="Advanced" 
  interactive={true}
  onClick={(tier) => console.log('Clicked:', tier)}
/>
```

### Tier Selector
```jsx
import TierSelector from './components/common/TierSelector';

<TierSelector
  onTierChange={(newTier) => {
    userTierManager.setUserTier(newTier);
    console.log('Tier changed to:', newTier);
  }}
/>
```

### Tier Status Indicator
```jsx
import TierStatusIndicator from './components/common/TierStatusIndicator';

// With upgrade prompt
<TierStatusIndicator showUpgradePrompt={true} />

// Custom upgrade handler
<TierStatusIndicator 
  showUpgradePrompt={true}
  onUpgrade={() => {
    // Custom upgrade logic
    handleUpgrade();
  }}
/>
```

## Tier Management

### UserTierManager Integration
The tier system integrates with the existing `userTierManager` from `src/config/userTiers.js`:

```javascript
import { userTierManager } from '../../config/userTiers';

// Get current tier
const currentTier = userTierManager.getCurrentTier();

// Set tier
userTierManager.setUserTier('PRO');

// Check capabilities
const canUpload = userTierManager.canAccessFeature('FILE_UPLOADS');
```

### Tier Persistence
- Tier selections are automatically saved to localStorage
- Persists across browser sessions
- Integrates with existing tier management system

## Styling

### Tier-Specific Colors
- **Advanced**: Blue to cyan gradient (`from-blue-500 to-cyan-600`)
- **PRO**: Purple to orange gradient (`from-purple-500 to-orange-500`)

### Icons
- **Advanced**: Shield icon (represents protection/basic features)
- **PRO**: Crown icon (represents premium/advanced features)

### Responsive Design
- Components adapt to different screen sizes
- Consistent spacing and typography
- Dark mode support throughout

## Benefits

### For Users
1. **Easy Tier Selection**: Simple click interface in header
2. **Clear Status Display**: Always know your current tier
3. **Quick Upgrades**: One-click upgrade options
4. **Consistent Experience**: Unified tier display across the app

### For Admins
1. **Separate from Admin Functions**: Tier selection doesn't interfere with admin controls
2. **User Self-Service**: Users can manage their own tiers
3. **Clear Differentiation**: Admin badge remains separate and exclusive

### For Developers
1. **Reusable Components**: Modular design for easy integration
2. **Consistent API**: Works with existing userTierManager
3. **Extensible**: Easy to add new tiers or modify existing ones

## Future Enhancements

### Potential Additions
1. **Tier Comparison Modal**: Side-by-side feature comparison
2. **Billing Integration**: Connect to payment systems
3. **Usage Analytics**: Track tier-specific feature usage
4. **Tier Badges in Content**: Show tier requirements on features
5. **Tier History**: Track tier changes over time

### Performance Considerations
- Components are optimized for frequent re-renders
- Minimal state management overhead
- Efficient localStorage usage

## Testing

### Manual Testing
1. **Header Integration**: Verify tier selector appears and functions
2. **Profile Dropdown**: Check tier status display
3. **Settings Page**: Confirm tier management section
4. **Tier Persistence**: Verify selections persist across sessions
5. **Upgrade Flow**: Test upgrade buttons and callbacks

### Automated Testing
Consider adding tests for:
- Component rendering with different props
- Tier switching functionality
- LocalStorage persistence
- Integration with userTierManager

## Conclusion

The Tier system provides a comprehensive, user-friendly way to manage account tiers while maintaining separation from admin functions. It offers flexibility for users to easily upgrade their experience while providing clear visual feedback about their current tier status throughout the application.
