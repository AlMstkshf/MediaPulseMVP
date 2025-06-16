import { useState } from "react";
import { Button } from "@/components/ui/button";
import GovEntityDialog from "@/components/entities/GovEntityDialog";
import { Toaster } from "@/components/ui/toaster";

export default function TestEntityDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Test Government Entity Dialog</h1>
      
      <div className="flex space-x-4 mb-8">
        <Button onClick={() => setDialogOpen(true)}>
          Add New Entity
        </Button>
        
        <Button onClick={() => setEditDialogOpen(true)}>
          Edit Existing Entity
        </Button>
      </div>
      
      {/* Create Dialog */}
      <GovEntityDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      
      {/* Edit Dialog */}
      <GovEntityDialog 
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        entityId={1} // Sample entity ID
      />
      
      <Toaster />
    </div>
  );
}