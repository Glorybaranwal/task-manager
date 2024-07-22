"use client"; // Required for client-side functionality

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Navbar from '../component/navbar';
import { IoIosAdd } from "react-icons/io";
import { MdDelete, MdOutlineSkipPrevious, MdOutlineWatchLater } from "react-icons/md";
import { MdOutlineSkipNext } from "react-icons/md";
import { IoIosDoneAll } from "react-icons/io";
import { FaRegEdit } from 'react-icons/fa';

interface Task {
    id: number;
    name: string;
    dueDate: string;
    done: boolean;
    priority: "low" | "medium" | "high";
    status: "pending" | "on-time";
}

const List: React.FC = () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    const [taskList, setTaskList] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState<string>("");
    const [newTaskDueDate, setNewTaskDueDate] = useState<string>(today);
    const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("low");
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [updatedTaskName, setUpdatedTaskName] = useState<string>("");
    const [updatedTaskDueDate, setUpdatedTaskDueDate] = useState<string>(today);
    const [updatedTaskPriority, setUpdatedTaskPriority] = useState<"low" | "medium" | "high">("low");
    const [navbarBgColor, setNavbarBgColor] = useState<string>("#e5e7eb-500");

    // Pagination states
    const [pendingPage, setPendingPage] = useState(1);
    const [todaysPage, setTodaysPage] = useState(1);
    const [upcomingPage, setUpcomingPage] = useState(1);
    const [pageLimit, setPageLimit] = useState(10);

    const addTask = useCallback(() => {
        if (newTask.trim() !== "" && newTaskDueDate !== "") {
            const newTaskObj: Task = { id: Date.now(), name: newTask, dueDate: newTaskDueDate, done: false, priority: newTaskPriority, status: "on-time" };
            setTaskList((prevTaskList) => [...prevTaskList, newTaskObj]);
            setNewTask("");
            setNewTaskDueDate(today); // Reset to today's date
            setNewTaskPriority("low");
        }
    }, [newTask, newTaskDueDate, newTaskPriority, today]);

    const editTask = useCallback((taskId: number, updatedTaskName: string, updatedTaskDueDate: string, updatedTaskPriority: "low" | "medium" | "high") => {
        setTaskList((prevTaskList) =>
            prevTaskList.map((task) =>
                task.id === taskId ? { ...task, name: updatedTaskName, dueDate: updatedTaskDueDate, priority: updatedTaskPriority } : task
            )
        );
    }, []);

    const deleteTask = useCallback((taskId: number) => {
        setTaskList((prevTaskList) =>
            prevTaskList.filter((task) => task.id !== taskId)
        );
    }, []);

    const toggleTaskStatus = useCallback((taskId: number) => {
        setTaskList((prevTaskList) =>
            prevTaskList.map((task) =>
                task.id === taskId ? { ...task, done: !task.done } : task
            )
        );
    }, []);

    const checkDueDates = useCallback(() => {
        const now = new Date();
        setTaskList((prevTaskList) =>
            prevTaskList.map((task) => {
                const dueDate = new Date(task.dueDate);
                if (dueDate < now && task.dueDate !== today && !task.done) {
                    return { ...task, status: "pending" };
                }
                return task;
            })
        );
    }, [today]);

    useEffect(() => {
        const timer = setInterval(checkDueDates, 60 * 1000); // Check every minute
        return () => clearInterval(timer);
    }, [checkDueDates]);

    const onDragEnd = (result: any) => {
        const { source, destination } = result;

        if (!destination) return;

        const movedTask = taskList[source.index];
        const updatedTasks = Array.from(taskList);
        updatedTasks.splice(source.index, 1);
        updatedTasks.splice(destination.index, 0, movedTask);

        setTaskList(updatedTasks);
    };

    const pendingTasks = useMemo(() => taskList.filter(task => task.status === "pending"), [taskList]);
    const todaysTasks = useMemo(() => taskList.filter(task => task.dueDate === today), [taskList, today]);
    const upcomingTasks = useMemo(() => taskList.filter(task => task.dueDate > today && task.status !== "pending"), [taskList, today]);

    const paginatedPendingTasks = useMemo(() => {
        const start = (pendingPage - 1) * pageLimit;
        return pendingTasks.slice(start, start + pageLimit);
    }, [pendingTasks, pendingPage, pageLimit]);

    const paginatedTodaysTasks = useMemo(() => {
        const start = (todaysPage - 1) * pageLimit;
        return todaysTasks.slice(start, start + pageLimit);
    }, [todaysTasks, todaysPage, pageLimit]);

    const paginatedUpcomingTasks = useMemo(() => {
        const start = (upcomingPage - 1) * pageLimit;
        return upcomingTasks.slice(start, start + pageLimit);
    }, [upcomingTasks, upcomingPage, pageLimit]);

    const handlePageChange = (setPage: React.Dispatch<React.SetStateAction<number>>, page: number, totalPages: number) => {
        if (page > 0 && page <= totalPages) {
            setPage(page);
        }
    };

    const totalPages = (tasksLength: number) => Math.ceil(tasksLength / pageLimit);

    return (
        <div className={`bg-${navbarBgColor} min-h-screen`} >
            <Navbar
                bgColor={navbarBgColor}
                onBgColorChange={setNavbarBgColor}
            />
            <div className="container mx-auto p-4 flex border justify-around gap-4 mt-10">
                <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                    <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add Task"
                        className="border border-gray-300 p-2 rounded-md w-full mb-2"
                    />
                    <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="border border-gray-300 p-2 rounded-md w-full mb-2"
                    />
                    <select
                        value={newTaskPriority}
                        onChange={(e) =>
                            setNewTaskPriority(e.target.value as "low" | "medium" | "high")
                        }
                        className="border border-gray-300 p-2 rounded-md w-full mb-2"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <button
                        onClick={addTask}
                        className={`border bg-transparent text-black px-4 py-2 rounded-md w-full hover:bg-opacity-80 transition-colors`}
                    >
                        Add Task
                    </button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-4 w-full">
                        <Droppable droppableId="pending">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="w-full md:w-1/3 bg-gray-50 p-4 rounded-lg shadow-md"
                                >
                                    <h2 className="text-xl font-semibold mb-2">Pending Tasks</h2>
                                    {paginatedPendingTasks.length > 0 ? (
                                        paginatedPendingTasks.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="bg-white p-4 mb-2 border border-gray-200 rounded-lg shadow-sm"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h3 className="font-semibold text-lg">{task.name}</h3>
                                                                <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
                                                                <p className="text-sm text-gray-600">Priority: {task.priority}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedTaskId(task.id);
                                                                        setUpdatedTaskName(task.name);
                                                                        setUpdatedTaskDueDate(task.dueDate);
                                                                        setUpdatedTaskPriority(task.priority);
                                                                    }}
                                                                    className={`border bg-transparent text-black px-2 py-1 rounded-md hover:bg-opacity-80 transition-colors`}
                                                                >
                                                                    <FaRegEdit />
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleTaskStatus(task.id)}
                                                                    className={`px-2 py-1 rounded-md ${task.done ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                                                                >
                                                                    {task.done ? <MdOutlineWatchLater /> : <IoIosDoneAll />}
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteTask(task.id)}
                                                                    className={`border bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors`}
                                                                >
                                                                    <MdDelete />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))
                                    ) : (
                                        <div className="text-gray-500">No Pending Tasks</div>
                                    )}
                                    {provided.placeholder}
                                    <div className="flex justify-between items-center mt-2">
                                        <button
                                            onClick={() => handlePageChange(setPendingPage, pendingPage - 1, totalPages(pendingTasks.length))}
                                            className="bg-blue-500 text-white px-2 py-1 rounded-md"
                                        >
                                            <MdOutlineSkipPrevious />
                                        </button>
                                        <span>Page {pendingPage} of {totalPages(pendingTasks.length)}</span>
                                        <button
                                            onClick={() => handlePageChange(setPendingPage, pendingPage + 1, totalPages(pendingTasks.length))}
                                            className="bg-blue-500 text-white px-2 py-1 rounded-md"
                                        >
                                            <MdOutlineSkipNext />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Droppable>

                        <Droppable droppableId="today">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="w-full md:w-1/3 bg-gray-50 p-4 rounded-lg shadow-md"
                                >
                                    <h2 className="text-xl font-semibold mb-2">Today's Tasks</h2>
                                    {paginatedTodaysTasks.length > 0 ? (
                                        paginatedTodaysTasks.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="bg-white p-4 mb-2 border border-gray-200 rounded-lg shadow-sm"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h3 className="font-semibold text-lg">{task.name}</h3>
                                                                <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
                                                                <p className="text-sm text-gray-600">Priority: {task.priority}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                {!task.done && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedTaskId(task.id);
                                                                            setUpdatedTaskName(task.name);
                                                                            setUpdatedTaskDueDate(task.dueDate);
                                                                            setUpdatedTaskPriority(task.priority);
                                                                        }}
                                                                        className={`border bg-transparent text-black px-2 py-1 rounded-md hover:bg-opacity-80 transition-colors`}
                                                                    >
                                                                        <FaRegEdit />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => toggleTaskStatus(task.id)}
                                                                    className={`px-2 py-1 rounded-md ${task.done ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                                                                >
                                                                    {task.done ? <MdOutlineWatchLater /> : <IoIosDoneAll />}
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteTask(task.id)}
                                                                    className={`bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors`}
                                                                >
                                                                    <MdDelete />
                                                                </button>

                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))
                                    ) : (
                                        <div className="text-gray-500">No Today's Tasks</div>
                                    )}
                                    {provided.placeholder}
                                    <div className="flex justify-between items-center mt-2">
                                        <button
                                            onClick={() => handlePageChange(setTodaysPage, todaysPage - 1, totalPages(todaysTasks.length))}
                                            className="bg-blue-500 text-white px-2 py-1 rounded-md"
                                        >
                                            <MdOutlineSkipPrevious />
                                        </button>
                                        <span>Page {todaysPage} of {totalPages(todaysTasks.length)}</span>
                                        <button
                                            onClick={() => handlePageChange(setTodaysPage, todaysPage + 1, totalPages(todaysTasks.length))}
                                            className="bg-blue-500 text-white px-2 py-1 rounded-md"
                                        >
                                            <MdOutlineSkipNext />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Droppable>

                        <Droppable droppableId="upcoming">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="w-full md:w-1/3 bg-gray-50 p-4 rounded-lg shadow-md"
                                >
                                    <h2 className="text-xl font-semibold mb-2">Upcoming Tasks</h2>
                                    {paginatedUpcomingTasks.length > 0 ? (
                                        paginatedUpcomingTasks.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="bg-white p-4 mb-2 border border-gray-200 rounded-lg shadow-sm"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h3 className="font-semibold text-lg">{task.name}</h3>
                                                                <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
                                                                <p className="text-sm text-gray-600">Priority: {task.priority}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                {!task.done && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedTaskId(task.id);
                                                                            setUpdatedTaskName(task.name);
                                                                            setUpdatedTaskDueDate(task.dueDate);
                                                                            setUpdatedTaskPriority(task.priority);
                                                                        }}
                                                                        className={`border bg-transparent text-black px-2 py-1 rounded-md hover:bg-opacity-80 transition-colors`}
                                                                    >
                                                                        <FaRegEdit color='gray' />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => toggleTaskStatus(task.id)}
                                                                    className={`px-2 py-1 rounded-md ${task.done ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                                                                >
                                                                    {task.done ? <MdOutlineWatchLater /> : <IoIosDoneAll color='green' />}
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteTask(task.id)}
                                                                    className={`bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors`}
                                                                >
                                                                    <MdDelete color='red' />
                                                                </button>






                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))
                                    ) : (
                                        <div className="text-gray-500">No Upcoming Tasks</div>
                                    )}
                                    {provided.placeholder}
                                    <div className="flex justify-between items-center mt-2">
                                        <button
                                            onClick={() => handlePageChange(setUpcomingPage, upcomingPage - 1, totalPages(upcomingTasks.length))}
                                            className="bg-blue-500 text-white px-2 py-1 rounded-md"
                                        >
                                            <MdOutlineSkipPrevious />
                                        </button>
                                        <span>Page {upcomingPage} of {totalPages(upcomingTasks.length)}</span>
                                        <button
                                            onClick={() => handlePageChange(setUpcomingPage, upcomingPage + 1, totalPages(upcomingTasks.length))}
                                            className="bg-blue-500 text-white px-2 py-1 rounded-md"
                                        >
                                            <MdOutlineSkipNext />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </div>
                </DragDropContext>
            </div>

            {selectedTaskId !== null && (
                <div className="container mt-8 bg-white p-4 rounded-lg shadow-md">
                    <h3 className="border bg-transparent text-black text-xl font-semibold mb-4">Edit Task</h3>
                    <input
                        type="text"
                        value={updatedTaskName}
                        onChange={(e) => setUpdatedTaskName(e.target.value)}
                        placeholder="Updated Task Name"
                        className="border border-gray-300 p-2 rounded-md w-full mb-2"
                    />
                    <input
                        type="date"
                        value={updatedTaskDueDate}
                        onChange={(e) => setUpdatedTaskDueDate(e.target.value)}
                        className="border border-gray-300 p-2 rounded-md w-full mb-2"
                    />
                    <select
                        value={updatedTaskPriority}
                        onChange={(e) => setUpdatedTaskPriority(e.target.value as "low" | "medium" | "high")}
                        className="border border-gray-300 p-2 rounded-md w-full mb-2"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <button
                        onClick={() => {
                            editTask(selectedTaskId, updatedTaskName, updatedTaskDueDate, updatedTaskPriority);
                            setSelectedTaskId(null);
                            setUpdatedTaskName("");
                            setUpdatedTaskDueDate(today);
                            setUpdatedTaskPriority("low");
                        }}
                        className={` text-white px-4 py-2 rounded-md w-full hover:bg-opacity-80 transition-colors`}
                    >
                        Update Task
                    </button>
                    <button
                        onClick={() => {
                            setSelectedTaskId(null);
                            setUpdatedTaskName("");
                            setUpdatedTaskDueDate(today);
                            setUpdatedTaskPriority("low");
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-md w-full mt-2 hover:bg-red-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default List;
