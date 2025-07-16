import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type ProfileFormValues = {
  name: string;
  bio: string;
  avatarUrl: string;
  phoneNumber: string;
  interests: string;
};

// Password change form schema with validation
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

interface EditProfileModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function EditProfileModal({ open: propOpen, onOpenChange }: EditProfileModalProps) {
  const [open, setOpen] = useState(propOpen || false);
  // Using defaultValue in the Accordion instead of state
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Handle external open/close
  useEffect(() => {
    if (propOpen !== undefined) {
      setOpen(propOpen);
    }
  }, [propOpen]);
  
  // Handle internal open/close and propagate
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };
  
  // Profile form
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
      avatarUrl: user?.avatarUrl || "",
      phoneNumber: user?.phoneNumber || "",
      interests: user?.interests ? user.interests.join(", ") : "",
    },
  });
  
  // Password change form
  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      // Convert comma-separated interests to array
      const interests = values.interests
        ? values.interests.split(",").map(i => i.trim()).filter(Boolean)
        : [];
        
      const payload = {
        ...values,
        interests,
      };
      
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, payload);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update profile");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (values: PasswordChangeFormValues) => {
      const res = await apiRequest("POST", `/api/users/${user?.id}/change-password`, values);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to change password");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset();
      // Close the accordion after password change
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to change password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };
  
  const onPasswordSubmit = (values: PasswordChangeFormValues) => {
    changePasswordMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Edit className="h-4 w-4 mr-1" />
            Edit Profile
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <Accordion 
          type="single" 
          collapsible 
          defaultValue="profile"
          className="w-full mt-4"
        >
          <AccordionItem value="profile">
            <AccordionTrigger className="text-md font-medium">
              Profile Information
            </AccordionTrigger>
            <AccordionContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    placeholder="Your display name"
                    {...form.register("name")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Profile Picture URL</Label>
                  <Input
                    id="avatarUrl"
                    placeholder="https://example.com/your-image.jpg"
                    {...form.register("avatarUrl")}
                  />
                  {form.watch("avatarUrl") && (
                    <div className="mt-2">
                      <img 
                        src={form.watch("avatarUrl")}
                        alt="Avatar preview"
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Error";
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+1 (555) 123-4567"
                    {...form.register("phoneNumber")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    {...form.register("bio")}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interests">Interests (comma separated)</Label>
                  <Input
                    id="interests"
                    placeholder="Meditation, Yoga, Nature..."
                    {...form.register("interests")}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="password">
            <AccordionTrigger className="text-md font-medium">
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                    {...passwordForm.register("currentPassword")}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    {...passwordForm.register("newPassword")}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    {...passwordForm.register("confirmPassword")}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}