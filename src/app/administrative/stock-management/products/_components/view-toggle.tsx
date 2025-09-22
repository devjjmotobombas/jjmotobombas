"use client";

import { Grid3X3, List } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ViewToggleProps {
    view: "table" | "cards";
    onViewChange: (view: "table" | "cards") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
                variant={view === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("table")}
                className="h-7 w-7 p-0 sm:h-8 sm:w-8"
            >
                <List className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
                variant={view === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("cards")}
                className="h-7 w-7 p-0 sm:h-8 sm:w-8"
            >
                <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
        </div>
    );
}
