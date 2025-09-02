import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FolderPlus, 
  Code, 
  Globe, 
  GitBranch, 
  Play, 
  Settings,
  FileText,
  Database,
  Zap
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  type: string;
  status: "active" | "building" | "deployed";
  previewUrl?: string;
  lastModified: string;
}

interface ProjectManagerProps {
  onProjectSelect: (project: Project) => void;
  onNewProject: (template: string) => void;
}

export function ProjectManager({ onProjectSelect, onNewProject }: ProjectManagerProps) {
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "React Dashboard",
      type: "React + TypeScript",
      status: "deployed",
      previewUrl: "https://dashboard-demo.lovable.dev",
      lastModified: "2 hours ago"
    },
    {
      id: "2", 
      name: "E-commerce API",
      type: "Node.js + Express",
      status: "active",
      lastModified: "1 day ago"
    },
    {
      id: "3",
      name: "Portfolio Website", 
      type: "Next.js",
      status: "building",
      lastModified: "3 days ago"
    }
  ]);

  const [newProjectName, setNewProjectName] = useState("");

  const templates = [
    { name: "React App", icon: Code, description: "Modern React with TypeScript" },
    { name: "Full Stack", icon: Database, description: "React + Node.js + Database" },
    { name: "Landing Page", icon: Globe, description: "Beautiful marketing site" },
    { name: "API Server", icon: Zap, description: "RESTful API with Express" },
    { name: "Dashboard", icon: Settings, description: "Admin dashboard template" },
    { name: "Blog", icon: FileText, description: "Content management system" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-ai-primary";
      case "building": return "bg-yellow-500";
      case "deployed": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Project Manager
          </h1>
          <p className="text-muted-foreground">Manage your coding projects and templates</p>
        </div>
        <Button className="shadow-glow">
          <FolderPlus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Quick Templates */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Quick Start Templates</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {templates.map((template) => (
            <Card 
              key={template.name}
              className="cursor-pointer hover:shadow-md transition-shadow bg-card/50 backdrop-blur-sm"
              onClick={() => onNewProject(template.name)}
            >
              <CardContent className="p-4 text-center">
                <template.icon className="h-8 w-8 mx-auto mb-2 text-ai-primary" />
                <h3 className="font-medium text-sm mb-1">{template.name}</h3>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Projects</h2>
        <ScrollArea className="h-[400px]">
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card 
                key={project.id}
                className="cursor-pointer hover:shadow-md transition-shadow bg-card/50 backdrop-blur-sm"
                onClick={() => onProjectSelect(project)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge 
                      className={`${getStatusColor(project.status)} text-white capitalize`}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.type}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Modified {project.lastModified}</span>
                    <div className="flex items-center gap-2">
                      {project.previewUrl && (
                        <Button size="sm" variant="outline">
                          <Globe className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Code className="h-3 w-3 mr-1" />
                        Open
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Create Custom Project */}
      <Card className="bg-gradient-subtle border-ai-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-ai-primary" />
            Create Custom Project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter project name..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="bg-background/50"
          />
          <div className="flex gap-2">
            <Button 
              className="flex-1 shadow-glow"
              disabled={!newProjectName.trim()}
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Create from Scratch
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              disabled={!newProjectName.trim()}
            >
              <Play className="mr-2 h-4 w-4" />
              Import from GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}