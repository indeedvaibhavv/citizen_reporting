import { useState } from "react";
import { Factory, Trash2, Construction, Droplet } from "lucide-react";
import { Card } from "./ui/card";

export type IssueCategory = "air" | "garbage" | "construction" | "water";

interface CategorySelectorProps {
  selectedCategory: IssueCategory | null;
  onSelect: (category: IssueCategory) => void;
}

const categories = [
  {
    id: "air" as IssueCategory,
    icon: Factory,
    label: "Air Pollution",
    emoji: "🏭",
  },
  {
    id: "garbage" as IssueCategory,
    icon: Trash2,
    label: "Garbage / Waste",
    emoji: "🗑️",
  },
  {
    id: "construction" as IssueCategory,
    icon: Construction,
    label: "Construction Dust",
    emoji: "🚧",
  },
  {
    id: "water" as IssueCategory,
    icon: Droplet,
    label: "Water Pollution",
    emoji: "💧",
  },
];

export function CategorySelector({ selectedCategory, onSelect }: CategorySelectorProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Issue Category</h3>
        <p className="text-sm text-gray-600">
          Helps apply relevant validation checks.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${isSelected 
                  ? "border-emerald-600 bg-emerald-50" 
                  : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                }
              `}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${isSelected ? "bg-emerald-100" : "bg-gray-100"}
                `}>
                  <Icon className={`w-6 h-6 ${isSelected ? "text-emerald-600" : "text-gray-600"}`} />
                </div>
                <span className="text-xl">{category.emoji}</span>
                <p className={`text-sm font-medium ${isSelected ? "text-emerald-900" : "text-gray-700"}`}>
                  {category.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}