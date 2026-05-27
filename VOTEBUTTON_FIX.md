# VoteButton Fix

## Issue Found
The VoteButton component had a type mismatch in the `size` prop.

## Error Details
```
Error: Type '"sm" | "lg" | "default" | "icon"' is not assignable to type '"sm" | "md" | "lg" | "icon" | undefined'.
Type '"default"' is not assignable to type '"sm" | "md" | "lg" | "icon" | undefined'.
```

## Root Cause
The VoteButton component defined its size prop as:
```typescript
size?: "default" | "sm" | "lg" | "icon";
```

But the Button component it uses only accepts:
```typescript
size?: "sm" | "md" | "lg" | "icon";
```

The mismatch:
- VoteButton used `"default"` (which doesn't exist in Button)
- VoteButton was missing `"md"` (which is the actual default in Button)

## Fix Applied

**Before**:
```typescript
interface VoteButtonProps {
  campaignId: string;
  campaignSlug: string;
  campaignStatus: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";  // ❌ Wrong
  className?: string;
}

export function VoteButton({
  campaignId,
  campaignSlug,
  campaignStatus,
  variant = "default",
  size = "default",  // ❌ Wrong default
  className,
}: VoteButtonProps) {
```

**After**:
```typescript
interface VoteButtonProps {
  campaignId: string;
  campaignSlug: string;
  campaignStatus: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";  // ✅ Correct
  className?: string;
}

export function VoteButton({
  campaignId,
  campaignSlug,
  campaignStatus,
  variant = "default",
  size = "md",  // ✅ Correct default
  className,
}: VoteButtonProps) {
```

## Changes Made
1. Changed size type from `"default" | "sm" | "lg" | "icon"` to `"sm" | "md" | "lg" | "icon"`
2. Changed default size from `"default"` to `"md"`

## Verification
✅ **VoteButton.tsx**: 0 errors (was 1 error)

## Component Functionality
The VoteButton component now correctly:
- Accepts all valid Button size values
- Uses "md" as the default size (matching Button's default)
- Passes the size prop correctly to the underlying Button component

## Usage Examples
```tsx
// Default size (md)
<VoteButton campaignId="123" campaignSlug="my-song" campaignStatus="active" />

// Small size
<VoteButton 
  campaignId="123" 
  campaignSlug="my-song" 
  campaignStatus="active" 
  size="sm" 
/>

// Large size
<VoteButton 
  campaignId="123" 
  campaignSlug="my-song" 
  campaignStatus="active" 
  size="lg" 
/>

// Icon only
<VoteButton 
  campaignId="123" 
  campaignSlug="my-song" 
  campaignStatus="active" 
  size="icon" 
/>
```

## Status
✅ **Fixed and verified**
✅ **No TypeScript errors**
✅ **Ready for use**
