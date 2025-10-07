import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface EditTaskFormProps {
  task: {
    id: string;
    title: string;
    description?: string;
    columnId: string;
  };
  columns: { _id: string; name: string }[];
  onSubmit: (data: {
    title?: string;
    description?: string;
    columnId?: string;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const EditTaskForm: React.FC<EditTaskFormProps> = ({
  task,
  columns,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ title: string; description: string }>({
    defaultValues: {
      title: task.title,
      description: task.description || "",
    },
  });

  const handleFormSubmit = (data: {
    title: string;
    description: string;
  }) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          {...register("title", { required: "Task title is required" })}
          className="mt-1"
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          className="mt-1"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Task"}
        </Button>
      </div>
    </form>
  );
};
