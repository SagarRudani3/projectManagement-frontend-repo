import {
  BuildingIcon,
  ChevronDownIcon,
  FolderIcon,
  InfoIcon,
  ListIcon,
  LogOutIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  Trash2Icon,
  FilePlus2,
  Edit,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  createProject,
  getProjects,
  deleteProject,
  getColumns,
  getTasks,
  createTask,
  deleteTask,
  editTask,
} from "../../lib/api";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Skeleton } from "../../components/ui/skeleton";
import { Modal } from "../../components/ui/modal";
import { CreateProjectForm } from "../../components/CreateProjectForm";
import { CreateTaskForm } from "../../components/CreateTaskForm";
import { EditTaskForm } from "../../components/EditTaskForm";
import { TaskCard } from "../../components/TaskCard";
import { useToast } from "../../lib/toast";
import { useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { moveTask } from "../../lib/api";

const sidebarItems = [
  { icon: SearchIcon, label: "Search", shortcut: "/" },
  { icon: SettingsIcon, label: "Settings" },
];

const SkeletonCard = () => (
  <Card className="bg-[#fbfbfb] border-[#ebebeb] shadow-boxshadow-light-light w-full">
    <CardContent className="pt-0 pb-1 px-0">
      <div className="flex items-center justify-between pt-2 pb-1 px-2">
        <div className="flex w-[62px] h-6 items-center gap-1 px-1 py-0 rounded">
          <Skeleton className="flex-1 h-4 rounded bg-[linear-gradient(90deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.02)_100%)]" />
        </div>
        <div className="w-6 h-6" />
      </div>
      <div className="flex flex-col items-start justify-center gap-0.5 pl-2.5 pr-2 pt-0 pb-1">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex h-6 items-center gap-1 w-full">
            <Skeleton className="w-4 h-4 rounded bg-[linear-gradient(90deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.02)_100%)]" />
            <Skeleton className="flex-1 h-4 rounded bg-[linear-gradient(90deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.02)_100%)]" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const SkeletonProjectItem = () => (
  <div className="pl-[11px] pr-0.5 py-0 flex items-center w-full rounded group">
    <div className="relative self-stretch w-[9px]">
      <div className="w-full h-full rounded-[0px_0px_0px_4px] border-b border-l border-[#8c8c8c]" />
    </div>
    <div className="flex h-7 items-center justify-between pl-1 pr-0 py-0 flex-1">
      <Skeleton className="h-4 w-24 rounded bg-[linear-gradient(90deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.02)_100%)]" />
      <Skeleton className="w-6 h-6 rounded-full bg-[linear-gradient(90deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.02)_100%)]" />
    </div>
  </div>
);

const ColumnDropzone = ({
  column,
  onDropTask,
  children,
}: {
  column: { _id: string };
  onDropTask: (
    taskId: string,
    newColumnId: string,
    oldColumnId: string
  ) => void;
  children: React.ReactNode;
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item: { _id: string; columnId: string }) => {
      console.log("Drop event - item:", item);
      console.log("Drop event - column:", column);
      if (item.columnId !== column._id) {
        onDropTask(item._id, column._id, item.columnId);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`flex flex-col items-start gap-2 p-2 flex-1 self-stretch bg-white ${
        isOver ? "bg-blue-100" : ""
      }`}
    >
      {children}
    </div>
  );
};

export const LoadingScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [projects, setProjects] = React.useState<
    { id: string; name: string }[]
  >([]);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    React.useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] =
    React.useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = React.useState(false);
  const [isCreatingProject, setIsCreatingProject] = React.useState(false);
  const [deletingProjectId, setDeletingProjectId] = React.useState<
    string | null
  >(null);
  const [isCreatingTask, setIsCreatingTask] = React.useState(false);
  const [isEditingTask, setIsEditingTask] = React.useState(false);
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [editingTask, setEditingTask] = React.useState<{
    id: string;
    title: string;
    description?: string;
    columnId: string;
  } | null>(null);
  console.log("%c Line:138 🥟 editingTask", "color:#465975", editingTask);
  const [isDeletingTask, setIsDeletingTask] = React.useState(false);
  const [deletingTaskId, setDeletingTaskId] = React.useState<string | null>(
    null
  );
  const [columns, setColumns] = React.useState<
    Array<{ _id: string; name: string }>
  >([]);
  console.log("%c Line:98 🍞 columns", "color:#42b983", columns);
  const [tasks, setTasks] = React.useState<
    Array<{
      _id: string;
      id: string;
      title: string;
      description?: string;
      creator?: { name: string };
      createdAt?: string;
      columnId: string;
    }>
  >([]);
  const [selectedProjectId, setSelectedProjectId] = React.useState<
    string | null
  >(null);
  const [isLoadingProjects, setIsLoadingProjects] = React.useState(false);
  const [isLoadingProjectData, setIsLoadingProjectData] = React.useState(false);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const fetchedProjects: any = await getProjects();

      if (fetchedProjects?.statusCode === 200) {
        setProjects(fetchedProjects?.data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleProjectClick = async (projectId: string) => {
    setIsLoadingProjectData(true);
    try {
      setSelectedProjectId(projectId);
      const fetchedColumns: any = await getColumns(projectId);
      if (fetchedColumns?.statusCode === 200) {
        setColumns(fetchedColumns?.data);

        const tasksPromises = fetchedColumns.data.map((column: any) =>
          getTasks(column._id)
        );
        const tasksResults = await Promise.all(tasksPromises);
        const allTasks = tasksResults.flatMap((result: any) =>
          result?.statusCode === 200 ? result.data : []
        );
        setTasks(allTasks);
      }
      console.log(`Fetched columns for project ${projectId}:`, fetchedColumns);
    } catch (error) {
      console.error(`Failed to fetch data for project ${projectId}:`, error);
      addToast("Failed to load project data.", "error");
    } finally {
      setIsLoadingProjectData(false);
    }
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleCreateProjectSubmit = async (data: {
    name: string;
    description: string;
  }) => {
    setIsCreatingProject(true);
    try {
      await createProject(data);
      fetchProjects();
      setIsCreateProjectModalOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      addToast("Failed to create project?.", "error");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setDeletingProjectId(id);
    try {
      await deleteProject(id);
      fetchProjects();
      addToast("Project deleted successfully.", "success");
    } catch (error) {
      console.error("Failed to delete project:", error);
      addToast("Failed to delete project?.", "error");
    } finally {
      setDeletingProjectId(null);
    }
  };

  const handleCreateTaskSubmit = async (data: {
    title: string;
    description?: string;
    projectId: string;
    columnId: string;
  }) => {
    setIsCreatingTask(true);
    try {
      await createTask(data);
      if (selectedProjectId) {
        const fetchedColumns: any = await getColumns(selectedProjectId);
        if (fetchedColumns?.statusCode === 200) {
          const tasksPromises = fetchedColumns.data.map((column: any) =>
            getTasks(column._id)
          );
          const tasksResults = await Promise.all(tasksPromises);
          const allTasks = tasksResults.flatMap((result: any) =>
            result?.statusCode === 200 ? result.data : []
          );
          setTasks(allTasks);
        }
      }
      setIsCreateTaskModalOpen(false);
      addToast("Task created successfully.", "success");
    } catch (error) {
      console.error("Failed to create task:", error);
      addToast("Failed to create task.", "error");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setDeletingTaskId(taskId);
    try {
      await deleteTask(taskId);
      if (selectedProjectId) {
        const fetchedColumns: any = await getColumns(selectedProjectId);
        if (fetchedColumns?.statusCode === 200) {
          const tasksPromises = fetchedColumns.data.map((column: any) =>
            getTasks(column._id)
          );
          const tasksResults = await Promise.all(tasksPromises);
          const allTasks = tasksResults.flatMap((result: any) =>
            result?.statusCode === 200 ? result.data : []
          );
          setTasks(allTasks);
        }
      }
      addToast("Task deleted successfully.", "success");
    } catch (error) {
      console.error("Failed to delete task:", error);
      addToast("Failed to delete task.", "error");
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleOpenEditModal = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask({
        id: task.id,
        title: task.title,
        description: task.description,
        columnId: task.columnId,
      });
      setIsEditTaskModalOpen(true);
    }
  };

  const handleEditTaskSubmit = async (data: {
    title?: string;
    description?: string;
  }) => {
    if (!editingTask) return;

    const currentColumnId = editingTask.columnId;

    setIsEditingTask(true);
    try {
      await editTask(editingTask.id, data);

      const updatedTasks: any = await getTasks(currentColumnId);
      if (updatedTasks?.statusCode === 200) {
        setTasks((prevTasks) => {
          const otherTasks = prevTasks?.filter(
            (task) => task.columnId !== currentColumnId
          );
          return [...otherTasks, ...updatedTasks.data];
        });
      }

      setIsEditTaskModalOpen(false);
      setEditingTask(null);
      addToast("Task updated successfully.", "success");
    } catch (error) {
      console.error("Failed to update task:", error);
      addToast("Failed to update task.", "error");
    } finally {
      setIsEditingTask(false);
    }
  };

  const handleTaskDrop = React.useCallback(
    async (taskId: string, newColumnId: string, oldColumnId: string) => {
      console.log("handleTaskDrop called with:", {
        taskId,
        newColumnId,
        oldColumnId,
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, columnId: newColumnId } : task
        )
      );

      try {
        await moveTask(taskId, newColumnId);
        const [sourceColumnTasks, destinationColumnTasks]: any =
          await Promise.all([getTasks(oldColumnId), getTasks(newColumnId)]);

        setTasks((prevTasks) => {
          const otherTasks = prevTasks.filter(
            (task) =>
              task.columnId !== oldColumnId && task.columnId !== newColumnId
          );

          const updatedTasks = [
            ...(sourceColumnTasks?.statusCode === 200
              ? sourceColumnTasks.data
              : []),
            ...(destinationColumnTasks?.statusCode === 200
              ? destinationColumnTasks.data
              : []),
          ];

          return [...otherTasks, ...updatedTasks];
        });

        addToast("Task moved successfully.", "success");
      } catch (error) {
        console.error("Failed to move task:", error);
        addToast("Failed to move task.", "error");
        setTasks((prevTasks) =>
          prevTasks?.map((task) =>
            task._id === taskId ? { ...task, columnId: oldColumnId } : task
          )
        );
      }
    },
    [addToast]
  );

  return (
    <>
      {" "}
      <DndProvider backend={HTML5Backend}>
        <Modal
          isOpen={isCreateProjectModalOpen}
          onClose={() => setIsCreateProjectModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <FilePlus2 className="w-5 h-5" />
              <span>Create New Project</span>
            </div>
          }
        >
          <CreateProjectForm
            onSubmit={handleCreateProjectSubmit}
            onCancel={() => setIsCreateProjectModalOpen(false)}
            isSubmitting={isCreatingProject}
          />
        </Modal>

        <Modal
          isOpen={isCreateTaskModalOpen}
          onClose={() => setIsCreateTaskModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              <span>Create New Task</span>
            </div>
          }
        >
          <CreateTaskForm
            projectId={selectedProjectId}
            columns={columns}
            onSubmit={handleCreateTaskSubmit}
            onCancel={() => setIsCreateTaskModalOpen(false)}
            isSubmitting={isCreatingTask}
          />
        </Modal>

        <Modal
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false);
            setEditingTask(null);
          }}
          title={
            <div className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              <span>Edit Task</span>
            </div>
          }
        >
          {editingTask && (
            <EditTaskForm
              task={editingTask}
              columns={columns}
              onSubmit={handleEditTaskSubmit}
              onCancel={() => {
                setIsEditTaskModalOpen(false);
                setEditingTask(null);
              }}
              isSubmitting={isEditingTask}
            />
          )}
        </Modal>

        <div className="bg-[url(/background-noise.svg)] bg-cover bg-[50%_50%] w-full h-screen flex">
          <div className="flex flex-1 w-full h-full items-start min-w-[1280px]">
            <aside className="flex flex-col w-[220px] items-start justify-between px-2 py-3 self-stretch">
              <ScrollArea className="flex flex-col items-start gap-3 flex-1 self-stretch w-full">
                <div className="flex h-8 items-center gap-2.5 w-full">
                  <Button
                    variant="ghost"
                    className="h-7 gap-2 px-1 py-2 rounded h-auto"
                  >
                    <div className="w-4 h-4 bg-[#d732a8] rounded-sm" />
                    <span className="font-base-medium font-[number:var(--base-medium-font-weight)] text-[#333333] text-[length:var(--base-medium-font-size)] tracking-[var(--base-medium-letter-spacing)] leading-[var(--base-medium-line-height)] [font-style:var(--base-medium-font-style)]">
                      Cognito
                    </span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </Button>
                </div>

                <nav className="flex flex-col items-start gap-3 w-full">
                  <div className="flex flex-col items-start gap-0.5 w-full">
                    {sidebarItems.map((item, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="h-7 gap-1 pl-1 pr-0.5 py-1 w-full justify-start rounded h-auto"
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="flex-1 text-left font-base-medium font-[number:var(--base-medium-font-weight)] text-[#666666] text-[length:var(--base-medium-font-size)] tracking-[var(--base-medium-letter-spacing)] leading-[var(--base-medium-line-height)] [font-style:var(--base-medium-font-style)]">
                          {item.label}
                        </span>
                        {item.shortcut && (
                          <div className="w-5 h-5 flex items-center justify-center gap-2">
                            <div className="w-4 h-4 bg-[#00000005] rounded border border-solid border-[#d5d5d5] flex items-center justify-center">
                              <span className="font-label-default font-[number:var(--label-default-font-weight)] text-[#999999] text-[length:var(--label-default-font-size)] tracking-[var(--label-default-letter-spacing)] leading-[var(--label-default-line-height)] [font-style:var(--label-default-font-style)]">
                                {item.shortcut}
                              </span>
                            </div>
                          </div>
                        )}
                      </Button>
                    ))}
                  </div>

                  <div className="flex flex-col items-start gap-0.5 w-full">
                    <div className="flex h-7 items-center justify-between gap-2.5 pl-1 pr-0.5 py-0 w-full rounded">
                      <span className="flex-1 font-label-default font-[number:var(--label-default-font-weight)] text-[#b3b3b3] text-[length:var(--label-default-font-size)] tracking-[var(--label-default-letter-spacing)] leading-[var(--label-default-line-height)] [font-style:var(--label-default-font-style)]">
                        Favorites
                      </span>
                      <Button
                        variant="ghost"
                        className="w-6 h-6 p-0"
                        onClick={() => setIsCreateProjectModalOpen(true)}
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="flex flex-col items-start w-full">
                      <Button
                        variant="ghost"
                        className="h-7 gap-1 pl-1 pr-0.5 py-1 w-full justify-start rounded h-auto"
                      >
                        <FolderIcon className="w-4 h-4" />
                        <span className="flex-1 text-left font-base-medium font-[number:var(--base-medium-font-weight)] text-[#666666] text-[length:var(--base-medium-font-size)] tracking-[var(--base-medium-letter-spacing)] leading-[var(--base-medium-line-height)] [font-style:var(--base-medium-font-style)]">
                          Team
                        </span>
                      </Button>

                      <div className="flex flex-col items-start w-full">
                        {isLoadingProjects
                          ? [...Array(3)].map((_, index) => (
                              <SkeletonProjectItem key={index} />
                            ))
                          : projects?.map((project, index) => (
                              <React.Fragment key={index}>
                                <div className="flex items-start gap-1 pl-[11px] pr-0 py-0 w-full rounded">
                                  <div className="w-px h-0.5 bg-[#999999]" />
                                </div>
                                <div className="pl-[11px] pr-0.5 py-0 flex items-center w-full rounded group">
                                  <div className="relative self-stretch w-[9px]">
                                    <div
                                      className={`w-full ${
                                        index === projects?.length - 1
                                          ? "h-[54.17%]"
                                          : "h-full"
                                      } rounded-[0px_0px_0px_4px] border-b border-l border-[#8c8c8c]`}
                                    />
                                    {index === 0 && (
                                      <div className="w-[11.11%] h-full bg-[#8c8c8c] absolute top-0 left-0" />
                                    )}
                                  </div>
                                  <div
                                    className="flex h-7 items-center justify-between pl-1 pr-0 py-0 flex-1 cursor-pointer"
                                    onClick={() =>
                                      handleProjectClick(project?.id)
                                    }
                                  >
                                    <span className="font-base-medium font-[number:var(--base-medium-font-weight)] text-[#666666] text-[length:var(--base-medium-font-size)] tracking-[var(--base-medium-letter-spacing)] leading-[var(--base-medium-line-height)] [font-style:var(--base-medium-font-style)]">
                                      {project?.name}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-6 h-6 opacity-0 group-hover:opacity-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteProject(project?.id);
                                      }}
                                      disabled={
                                        deletingProjectId === project?.id
                                      }
                                    >
                                      <Trash2Icon className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>{" "}
                                </div>
                              </React.Fragment>
                            ))}
                        <div className="flex items-start gap-1 pl-[11px] pr-0 py-0 w-full rounded">
                          <div className="w-px h-0.5 bg-[#999999]" />
                        </div>
                        <div className="flex items-center pl-[11px] pr-0.5 py-0 w-full rounded">
                          <div className="flex h-7 items-center justify-between pl-1 pr-0 py-0 flex-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </nav>
              </ScrollArea>

              <div className="w-full">
                <Button
                  variant="ghost"
                  className="h-6 gap-1 p-2 rounded h-auto w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOutIcon className="w-3.5 h-3.5" />
                  <span className="font-base-regular font-[number:var(--base-regular-font-weight)] text-[#999999] text-[length:var(--base-regular-font-size)] tracking-[var(--base-regular-letter-spacing)] leading-[var(--base-regular-line-height)] [font-style:var(--base-regular-font-style)]">
                    Logout
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="h-6 gap-1 p-2 rounded h-auto w-full justify-start"
                >
                  <InfoIcon className="w-3.5 h-3.5" />
                  <span className="font-base-regular font-[number:var(--base-regular-font-weight)] text-[#999999] text-[length:var(--base-regular-font-size)] tracking-[var(--base-regular-letter-spacing)] leading-[var(--base-regular-line-height)] [font-style:var(--base-regular-font-style)]">
                    Support
                  </span>
                </Button>
              </div>
            </aside>

            <main className="flex flex-col items-start gap-3 pl-0 pr-3 py-3 flex-1 self-stretch">
              <header className="flex h-8 items-center justify-between w-full rounded-[8px_8px_0px_0px] backdrop-blur-[5px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(5px)_brightness(100%)]">
                <div className="inline-flex h-6 gap-1 items-center">
                  <div className="inline-flex h-5 items-center justify-center gap-1 px-0.5 py-0 rounded">
                    <BuildingIcon className="w-4 h-4" />
                    <div className="inline-flex h-4 items-center gap-2 px-0.5 py-0 rounded-sm">
                      <h1 className="font-base-medium font-[number:var(--base-medium-font-weight)] text-[#333333] text-[length:var(--base-medium-font-size)] tracking-[var(--base-medium-letter-spacing)] leading-[var(--base-medium-line-height)] [font-style:var(--base-medium-font-style)]">
                        Page Title
                      </h1>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="h-6 gap-1 p-2 border-[#00000014] h-auto"
                  onClick={() => setIsCreateProjectModalOpen(true)}
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span className="font-base-medium font-[number:var(--base-medium-font-weight)] text-[#666666] text-[length:var(--base-medium-font-size)] tracking-[var(--base-medium-letter-spacing)] leading-[var(--base-medium-line-height)] [font-style:var(--base-medium-font-style)]">
                    New Project
                  </span>
                </Button>
              </header>

              <div className="flex flex-col items-start flex-1 self-stretch w-full bg-white rounded-lg overflow-hidden border border-solid border-[#ebebeb]">
                <div className="flex items-center justify-between p-2 w-full bg-white border-b border-[#f1f1f1] backdrop-blur-[5px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(5px)_brightness(100%)]">
                  <Button
                    variant="ghost"
                    className="h-6 gap-1 px-1 py-0 rounded h-auto"
                  >
                    <ListIcon className="w-4 h-4" />
                    <span className="font-base-medium font-[number:var(--base-medium-font-weight)] text-[#666666] text-[length:var(--base-medium-font-size)] tracking-[var(--base-medium-letter-spacing)] leading-[var(--base-medium-line-height)] [font-style:var(--base-medium-font-style)]">
                      All
                    </span>
                  </Button>

                  <div className="inline-flex items-center justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      className="h-6 gap-1 p-2 rounded h-auto"
                    >
                      <span className="font-base-regular font-[number:var(--base-regular-font-weight)] text-[#666666] text-[length:var(--base-regular-font-size)] tracking-[var(--base-regular-letter-spacing)] leading-[var(--base-regular-line-height)] [font-style:var(--base-regular-font-style)]">
                        Filter
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-6 gap-1 p-2 rounded h-auto"
                    >
                      <span className="font-base-regular font-[number:var(--base-regular-font-weight)] text-[#666666] text-[length:var(--base-regular-font-size)] tracking-[var(--base-regular-letter-spacing)] leading-[var(--base-regular-line-height)] [font-style:var(--base-regular-font-style)]">
                        Sort
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-6 gap-1 p-2 rounded h-auto"
                    >
                      <span className="font-base-regular font-[number:var(--base-regular-font-weight)] text-[#666666] text-[length:var(--base-regular-font-size)] tracking-[var(--base-regular-letter-spacing)] leading-[var(--base-regular-line-height)] [font-style:var(--base-regular-font-style)]">
                        Options
                      </span>
                    </Button>
                  </div>
                </div>

                <ScrollArea className="px-2 py-0 bg-white w-full flex-1">
                  <div className="h-full gap-px bg-[#f1f1f1] overflow-hidden overflow-x-scroll flex items-start w-full">
                    {isLoadingProjectData
                      ? [...Array(5)].map((_, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-start gap-2 p-2 flex-1 self-stretch bg-white"
                          >
                            <div className="flex h-6 items-center justify-between w-full">
                              <Skeleton className="h-5 w-20 rounded bg-[linear-gradient(90deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.02)_100%)]" />
                            </div>
                            <div className="flex flex-col items-start self-stretch w-full gap-2">
                              <SkeletonCard />
                              <SkeletonCard />
                              <SkeletonCard />
                            </div>
                          </div>
                        ))
                      : columns?.map((column: any, columnIndex: number) => {
                          return (
                            <ColumnDropzone
                              key={columnIndex}
                              column={column}
                              onDropTask={handleTaskDrop}
                            >
                              <div className="flex h-6 items-center justify-start gap-2 w-full">
                                <Badge
                                  className={`bg-gray-200 text-gray-800 h-5 px-2 py-[5.5px] rounded hover:bg-gray-300`}
                                >
                                  <span className="font-base-regular font-[number:var(--base-regular-font-weight)] text-[length:var(--base-regular-font-size)] tracking-[var(--base-regular-letter-spacing)] leading-[var(--base-regular-line-height)] [font-style:var(--base-regular-font-style)]">
                                    {column?.name}
                                  </span>
                                </Badge>
                                <p className="text-xs">{column?.taskCount}</p>
                              </div>

                              <div className="flex flex-col items-start self-stretch w-full gap-2">
                                {tasks?.filter(
                                  (task) => task?.columnId === column?._id
                                )?.length > 0 ? (
                                  tasks
                                    ?.filter(
                                      (task) => task?.columnId === column?._id
                                    )
                                    ?.map((task: any, cardIndex: number) => (
                                      <TaskCard
                                        key={cardIndex}
                                        task={task}
                                        onEdit={handleOpenEditModal}
                                        onDelete={handleDeleteTask}
                                        isDeleting={deletingTaskId === task.id}
                                      />
                                    ))
                                ) : (
                                  <Button
                                    variant="ghost"
                                    className="h-6 gap-1 p-2 rounded h-auto"
                                    onClick={() => {
                                      console.log("New task button clicked!");
                                      setIsCreateTaskModalOpen(true);
                                    }}
                                  >
                                    <PlusIcon className="w-3.5 h-3.5" />
                                    <span className="font-base-regular font-[number:var(--base-regular-font-weight)] text-[#999999] text-[length:var(--base-regular-font-size)] tracking-[var(--base-regular-letter-spacing)] leading-[var(--base-regular-line-height)] [font-style:var(--base-regular-font-style)]">
                                      New
                                    </span>
                                  </Button>
                                )}
                              </div>
                            </ColumnDropzone>
                          );
                        })}
                  </div>
                </ScrollArea>
              </div>
            </main>
          </div>
        </div>
      </DndProvider>
    </>
  );
};
