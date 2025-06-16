/**
 * Central export file for all UI components
 */

// Re-export Dialog components
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./Dialog";

// Button
export { Button, buttonVariants } from "./button";

// Form components
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "./form";

// Card components
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";

// Input components
export { Input } from "./input";
export { Label } from "./label";
export { Textarea } from "./textarea";
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
export { Checkbox } from "./checkbox";
export { Switch } from "./switch";
export { RadioGroup, RadioGroupItem } from "./radio-group";
export { Slider } from "./slider";

// Navigation components
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

// Feedback components
export { Alert, AlertTitle, AlertDescription } from "./alert";
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
export {
  Toast,
  ToastProvider,
  ToastViewport,
} from "./toast";
export { Toaster } from "./toaster";
export { useToast } from "@/hooks/useToast";
export { Progress } from "./progress";

// Overlay components
export { Popover, PopoverContent, PopoverTrigger } from "./popover";
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

// Display components
export { Avatar, AvatarImage, AvatarFallback } from "./avatar";
export { Badge, badgeVariants } from "./badge";
export { Skeleton } from "./skeleton";
export { Separator } from "./separator";
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./table";

// Other components
export { Calendar } from "./calendar";
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "./command";
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu";
export { ScrollArea, ScrollBar } from "./scroll-area";

// Utility and additional UI components
export { ExportDropdown } from "./export-dropdown";

// Drawer (Slide-up panel)
export {
  Drawer,
  DrawerTrigger,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerPortal,
  DrawerClose,
} from "./drawer";

// ContextMenu (Right-click menus)
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from "./context-menu";

// HoverCard (Tooltip-like popovers on hover)
export { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";
