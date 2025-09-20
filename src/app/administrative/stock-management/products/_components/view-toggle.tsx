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
                className="h-8 w-8 p-0"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant={view === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("cards")}
                className="h-8 w-8 p-0"
            >
                <Grid3X3 className="h-4 w-4" />
            </Button>
        </div>
    );
}
