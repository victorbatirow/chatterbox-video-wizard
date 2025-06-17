// src/services/api.ts

// Environment variable handling for both Vite and Create React App
const getApiBaseUrl = (): string => {
  // Try Vite environment variables first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  }
  
  // Fallback for Create React App
  if (typeof process !== 'undefined' && process.env) {
    return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
  }
  
  // Final fallback
  return 'http://localhost:8080';
};

const API_BASE_URL = getApiBaseUrl();

// Type definitions matching your backend API

export interface GeneratedVideo {
  clip_urls: string[];
  full_video_url: string;
}

export interface FilmGenerationResponse {
  text: string;
  generated_video?: GeneratedVideo;
}

export interface Project {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectResponse {
  project: Project;
  response: FilmGenerationResponse;
}

export interface ExternalMessage {
  id: string;
  project_id: string;
  message_type: 'user' | 'ai_response';
  text_content: string;
  video?: GeneratedVideo;
  created_at: string;
}

export interface ProjectDetails {
  project: Project;
  messages: ExternalMessage[];
}

export interface UserDetails {
  id: string;
  auth0_user_id: string;
  stripe_customer_id?: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  auth0_user_id: string;
  email: string;
  email_verified: string;
  created_at: string;
}

export interface CreateUserResponse {
  id: string;
  success: boolean;
  message: string;
}

export interface ChatPromptRequest {
  user_input: string;
  project_id: string;
}

export interface ChatPromptResponse {
  text: string;
  generated_video?: GeneratedVideo;
}

export interface CreateProjectRequest {
  initial_message?: string;
}

export interface VideoClipRequest {
  prompt: string;
  negative_prompt?: string;
  aspect_ratio?: 'PORTRAIT_9_16' | 'LANDSCAPE_16_9' | 'SQUARE_1_1';
}

export interface VideoClipResponse {
  video_url: string;
}

export interface VideoRenderRequest {
  project_id: string;
  clip_urls: string[];
}

export interface VideoRenderResponse {
  video_url: string;
}

export interface CreateCheckoutSessionRequest {
  price_id: string;
}

export interface CreateCheckoutSessionResponse {
  session_id: string;
}

// Base API error handling - Export this class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request handler with error handling
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse error JSON, use the status text
      }
      
      throw new ApiError(errorMessage, response.status, response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0
    );
  }
};

// API Functions

// User Management
export const createUser = async (
  token: string, 
  userData: CreateUserRequest
): Promise<CreateUserResponse> => {
  return apiRequest<CreateUserResponse>('/user/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
};

// Project Management
export const createProject = async (
  token: string, 
  initialMessage?: string
): Promise<CreateProjectResponse> => {
  const requestBody: CreateProjectRequest = {};
  if (initialMessage) {
    requestBody.initial_message = initialMessage;
  }

  return apiRequest<CreateProjectResponse>('/projects/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });
};

export const getProject = async (
  token: string, 
  projectId: string
): Promise<ProjectDetails> => {
  return apiRequest<ProjectDetails>(`/projects/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const getProjects = async (token: string): Promise<Project[]> => {
  return apiRequest<Project[]>('/projects', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Chat/AI Interaction
export const sendChatMessage = async (
  token: string, 
  projectId: string, 
  userInput: string
): Promise<ChatPromptResponse> => {
  const requestBody: ChatPromptRequest = {
    user_input: userInput,
    project_id: projectId,
  };

  return apiRequest<ChatPromptResponse>('/chat/prompt', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });
};

// Video Generation
export const generateVideoClip = async (
  token: string, 
  request: VideoClipRequest
): Promise<VideoClipResponse> => {
  return apiRequest<VideoClipResponse>('/video/generate-clip', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
};

export const renderVideo = async (
  token: string, 
  request: VideoRenderRequest
): Promise<VideoRenderResponse> => {
  return apiRequest<VideoRenderResponse>('/video/render', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
};

// Billing
export const createStripeCheckoutSession = async (
  token: string, 
  priceId: string
): Promise<CreateCheckoutSessionResponse> => {
  const requestBody: CreateCheckoutSessionRequest = {
    price_id: priceId,
  };

  return apiRequest<CreateCheckoutSessionResponse>('/billing/create-stripe-checkout-session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });
};

// Helper function to handle user creation on first login
export const ensureUserExists = async (token: string, user: any): Promise<void> => {
  try {
    const userData: CreateUserRequest = {
      auth0_user_id: user.sub,
      email: user.email,
      email_verified: user.email_verified?.toString() || 'false',
      created_at: user.created_at || new Date().toISOString(),
    };

    await createUser(token, userData);
  } catch (error) {
    // User might already exist, which is fine
    if (error instanceof ApiError) {
      // Check if it's a "user already exists" error
      if (error.status === 409 || error.message.toLowerCase().includes('already exists')) {
        console.log('User already exists in backend, continuing...');
        return;
      }
    }
    
    // Re-throw other errors
    throw error;
  }
};

// Utility function to check if API is reachable
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Export API base URL for debugging purposes
export { API_BASE_URL };

// Legacy interfaces for backward compatibility
export interface ChatMessage {
  id: string;
  text_content: string;
  message_type: 'user' | 'ai_response';
  created_at: string;
}

// Legacy function names for compatibility
export const sendMessage = sendChatMessage;
export const getUserProjects = getProjects;

// User Profile API
export interface UserProfile {
  monthly_credits: number;
  used_credits: number;
  subscribed_product_name: string;
  current_period_start: number;
  current_period_end: number;
  subscription_status: string;
  email: string;
  success: boolean;
  message: string;
}

export const getUserProfile = async (token: string): Promise<UserProfile> => {
  return apiRequest<UserProfile>('/user', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};