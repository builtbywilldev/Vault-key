import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Copy, 
  Eye, 
  EyeOff, 
  Globe, 
  Key, 
  Loader2, 
  Plus, 
  Trash, 
  Edit,
  User
} from "lucide-react";

// Type definition for saved password
interface SavedPassword {
  id: number;
  name: string;
  website?: string;
  username?: string;
  password: string;
  notes?: string;
  favorite: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

// Type for form data
interface PasswordFormData {
  name: string;
  website: string;
  username: string;
  password: string;
  notes: string;
  favorite: boolean;
  category: string;
}

export default function SavedPasswords() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for password visibility
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  
  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<SavedPassword | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<PasswordFormData>({
    name: "",
    website: "",
    username: "",
    password: "",
    notes: "",
    favorite: false,
    category: "",
  });
  
  // Fetch saved passwords
  const { 
    data: passwordsResponse, 
    isLoading,
    isError,
    refetch 
  } = useQuery<{status: string, data: SavedPassword[]}>({
    queryKey: ["/api/passwords"],
    enabled: isAuthenticated,
    retry: false,
  });
  
  // Extract passwords from response
  const savedPasswords = passwordsResponse?.data || [];

  // Create password mutation
  const createMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await apiRequest("POST", "/api/passwords", data);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save password");
      }
      
      const responseData = await response.json();
      if (responseData.status !== "success") {
        throw new Error(responseData.message || "Failed to save password");
      }
      
      return responseData.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      toast({
        title: "Password saved",
        description: "Your password has been securely saved",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PasswordFormData }) => {
      const response = await apiRequest("PATCH", `/api/passwords/${id}`, data);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update password");
      }
      
      const responseData = await response.json();
      if (responseData.status !== "success") {
        throw new Error(responseData.message || "Failed to update password");
      }
      
      return responseData.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });
      setIsEditDialogOpen(false);
      setCurrentPassword(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete password mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/passwords/${id}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete password");
      }
      
      const responseData = await response.json();
      if (responseData.status !== "success") {
        throw new Error(responseData.message || "Failed to delete password");
      }
      
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      toast({
        title: "Password deleted",
        description: "Your password has been permanently deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      website: "",
      username: "",
      password: "",
      notes: "",
      favorite: false,
      category: "",
    });
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Copy to clipboard
  const copyToClipboard = (text: string | undefined, itemName: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied!",
          description: `${itemName} copied to clipboard`,
        });
      },
      (err) => {
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  // Handle add password
  const handleAddPassword = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  // Handle edit password
  const handleEditPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword) {
      updateMutation.mutate({ id: currentPassword.id, data: formData });
    }
  };

  // Open edit dialog
  const openEditDialog = (password: SavedPassword) => {
    setCurrentPassword(password);
    setFormData({
      name: password.name,
      website: password.website || "",
      username: password.username || "",
      password: password.password,
      notes: password.notes || "",
      favorite: password.favorite,
      category: password.category || "",
    });
    setIsEditDialogOpen(true);
  };

  // Delete password
  const handleDeletePassword = (id: number) => {
    deleteMutation.mutate(id);
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            You need to sign in to view and manage your saved passwords.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => setLocation("/login")} className="w-full">
            Sign In
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Saved Passwords</h1>
          <p className="text-muted-foreground">
            Securely manage your saved passwords
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Add Password
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Password</DialogTitle>
              <DialogDescription>
                Save a new password to your secure vault
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddPassword} className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My Bank Account"
                  className="col-span-3"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="website" className="text-right">
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  placeholder="https://example.com"
                  className="col-span-3"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="username@example.com"
                  className="col-span-3"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="col-span-3"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="Banking, Social, Work, etc."
                  className="col-span-3"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional notes..."
                  className="col-span-3"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
              
              <DialogFooter className="sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Password"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Password Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Password</DialogTitle>
              <DialogDescription>
                Update your saved password details
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleEditPassword} className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-website" className="text-right">
                  Website
                </Label>
                <Input
                  id="edit-website"
                  name="website"
                  className="col-span-3"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-username" className="text-right">
                  Username
                </Label>
                <Input
                  id="edit-username"
                  name="username"
                  className="col-span-3"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-password" className="text-right">
                  Password
                </Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  className="col-span-3"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Input
                  id="edit-category"
                  name="category"
                  className="col-span-3"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-notes" className="text-right pt-2">
                  Notes
                </Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  className="col-span-3"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
              
              <DialogFooter className="sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setCurrentPassword(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : savedPasswords.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Saved Passwords</CardTitle>
            <CardDescription>
              You haven't saved any passwords yet. Click "Add Password" to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Website</TableHead>
                <TableHead className="hidden md:table-cell">Username</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedPasswords.map((password) => (
                <TableRow key={password.id}>
                  <TableCell className="font-medium">{password.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {password.website ? (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{password.website}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(password.website, "Website")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {password.username ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{password.username}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(password.username, "Username")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {visiblePasswords[password.id] ? password.password : "••••••••••••"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => togglePasswordVisibility(password.id)}
                      >
                        {visiblePasswords[password.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(password.password, "Password")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(password)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Password</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this password? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeletePassword(password.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}