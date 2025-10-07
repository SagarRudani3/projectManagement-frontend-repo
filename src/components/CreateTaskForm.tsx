import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface CreateTaskFormProps {
  projectId: string | null;
  columns: { _id: string; name: string }[];
  onSubmit: (data: {
    title: string;
    description?: string;
    projectId: string;
    columnId: string;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  projectId,
  columns,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ title: string; description: string; columnId: string }>();

  const handleFormSubmit = (data: {
    title: string;
    description: string;
    columnId: string;
  }) => {
    if (projectId) {
      onSubmit({ ...data, projectId });
    }
  };

  if (!projectId) {
    return (
      <div className="p-4 text-center text-gray-600">
        Please select a project first to create a task.
        <div className="flex justify-end space-x-2 mt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    );
  }

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
        <Label htmlFor="description">Description </Label>
        <Textarea
          id="description"
          {...register("description")}
          className="mt-1"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="columnId">Column</Label>
        <select
          id="columnId"
          {...register("columnId", { required: "Column is required" })}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          disabled={isSubmitting}
        >
          <option value="">Select a column</option>
          {columns?.map((column) => (
            <option key={column?._id} value={column?._id}>
              {column?.name}
            </option>
          ))}
        </select>
        {errors?.columnId && (
          <p className="text-red-500 text-sm">{errors.columnId.message}</p>
        )}
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
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
      </div>
    </form>
  );
};
