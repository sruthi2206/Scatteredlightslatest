import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff } from "lucide-react";

interface SecretDiaryPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hasExistingPin: boolean;
  onSetPin?: (pin: string) => Promise<void>;
  onVerifyPin?: (pin: string) => Promise<boolean>;
}

const SecretDiaryPinModal: React.FC<SecretDiaryPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  hasExistingPin,
  onSetPin,
  onVerifyPin
}) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setPin("");
    setConfirmPin("");
    setShowPin(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 4-digit PIN",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (hasExistingPin) {
        // Verify existing PIN
        if (onVerifyPin) {
          const isValid = await onVerifyPin(pin);
          if (isValid) {
            onSuccess();
            resetForm();
            onClose();
          } else {
            toast({
              title: "Incorrect PIN",
              description: "Please try again",
              variant: "destructive",
            });
          }
        }
      } else {
        // Set new PIN
        if (pin !== confirmPin) {
          toast({
            title: "PINs don't match",
            description: "Please make sure both PINs are identical",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (onSetPin) {
          await onSetPin(pin);
          toast({
            title: "PIN Set Successfully",
            description: "Your Secret Diary PIN has been created",
          });
          onSuccess();
          resetForm();
          onClose();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-center">
            <Lock className="w-5 h-5 mr-2 text-purple-600" />
            {hasExistingPin ? "Enter Secret Diary PIN" : "Create Secret Diary PIN"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {hasExistingPin 
              ? "Enter your 4-digit PIN to access your Secret Diary"
              : "Create a 4-digit PIN to protect your Secret Diary entries"
            }
          </DialogDescription>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <Label htmlFor="pin">
              {hasExistingPin ? "Enter PIN" : "Create PIN"}
            </Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="text-center text-2xl tracking-widest pr-10"
                maxLength={4}
                autoComplete="off"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {!hasExistingPin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <div className="relative">
                <Input
                  id="confirmPin"
                  type={showPin ? "text" : "password"}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="text-center text-2xl tracking-widest pr-10"
                  maxLength={4}
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pin.length !== 4 || (!hasExistingPin && confirmPin.length !== 4) || isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "..." : hasExistingPin ? "Unlock" : "Create PIN"}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default SecretDiaryPinModal;