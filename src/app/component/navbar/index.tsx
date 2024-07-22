import React from 'react';

interface NavbarProps {
    bgColor: string;
    onBgColorChange: (color: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ bgColor, onBgColorChange }) => {
    return (
        <nav className={`bg-${bgColor} border-b border-gray-300 shadow-md p-4`}>
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold ">Task Manager</h1>
                <div className="flex gap-4">
                    <select
                        value={bgColor}
                        onChange={(e) => onBgColorChange(e.target.value)}
                        className="bg-white border border-gray-300 rounded-md p-2"
                    >
                        <option value="#e5e7eb-500">Gray</option>
                        <option value="green-500">Green</option>
                        <option value="red-500">Red</option>
                        <option value="purple-500">Purple</option>
                    </select>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
