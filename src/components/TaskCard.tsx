import React from "react";
import { Card, CardContent } from "./ui/card";
import { useDrag } from "react-dnd";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    creator?: { name: string };
    createdAt?: string;
    columnId: string;
  };
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  isDeleting?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, isDeleting }) => {
  console.log("%c Line:17 🍻 task", "color:#ffdd4d", task);
  const formattedDate = task?.createdAt
    ? new Date(task?.createdAt).toLocaleString()
    : "N/A";

  const [{ isDragging }, drag] = useDrag(() => {
    const dragItem = { _id: task?.id, columnId: task.columnId };
    console.log("TaskCard drag item:", dragItem);
    console.log("Full task object:", task);
    return {
      type: "TASK",
      item: dragItem,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    };
  });

  return (
    <Card
      ref={drag}
      className={`bg-white border border-gray-200 shadow-sm w-full group ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">{task?.title}</h3>
            {task?.description && (
              <p className="text-xs text-gray-600 mt-1">{task?.description}</p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task.id);
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          {task?.creator && <span>By: {task?.creator.name}</span>}
          {task?.createdAt && <span>Created: {formattedDate}</span>}
        </div>
      </CardContent>
    </Card>
  );
};
