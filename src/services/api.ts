
import { User } from "@auth0/auth0-react";

const API_BASE_URL = 'http://localhost:8081';

export interface Project {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  project_id: string;
  message_type: 'user' | 'system' | 'ai_response' | 'ai_tool_call' | 'tool_result';
  text_content: string | null;
  tool_calls_json: string | null;
  tool_results_json: string | null;
  created_at: string;
}

export interface ProjectDetails {
  project: Project;
  messages: ChatMessage[];
}

export interface ChatResponse {
  text: string;
  clip_urls?: string[];
}

export interface CreateProjectResponse {
  project: Project;
  response: ChatResponse;
}

// Create user if needed (called after Auth0 login)
export const createUserIfNeeded = async (user: User, token: string): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/user/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        auth0_user_id: user.sub,
        email: user.email,
        email_verified: user.email_verified?.toString() || 'false',
        created_at: user.updated_at || new Date().toISOString()
      })
    });
  } catch (error) {
    // User might already exist, that's OK
    console.log('User creation response:', error);
  }
};

// Create a new project
export const createProject = async (token: string, initialMessage?: string): Promise<CreateProjectResponse> => {
  const response = await fetch(`${API_BASE_URL}/projects/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      initial_message: initialMessage || null 
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.status}`);
  }

  return response.json();
};

// Get all projects for user
export const getProjects = async (token: string): Promise<Project[]> => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get projects: ${response.status}`);
  }

  return response.json();
};

// Get project details with chat history
export const getProject = async (token: string, projectId: string): Promise<ProjectDetails> => {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get project: ${response.status}`);
  }

  return response.json();
};

// Send chat message
export const sendChatMessage = async (
  token: string, 
  projectId: string, 
  userInput: string
): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/chat/prompt`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      project_id: projectId,
      user_input: userInput
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.status}`);
  }

  return response.json();
};
