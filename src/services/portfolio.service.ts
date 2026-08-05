import { api } from './api';

export interface PortfolioProfile {
  id: string;
  slug: string;
  name: string;
  title?: string | null;
  institution?: string | null;
  avatarUrl: string | null;
  aboutPt: string | null;
  aboutEn: string | null;
  githubUrl: string | null;
  showGithub: boolean;
  lattesUrl: string | null;
  showLattes: boolean;
  linkedinUrl: string | null;
  showLinkedin: boolean;
  email: string | null;
  showEmail: boolean;
  address: string | null;
  themeColor?: string | null;
  surveys?: any[];
}

export interface PortfolioInterest {
  id: string;
  namePt: string;
  nameEn: string;
  orderIndex: number;
}

export interface PortfolioEducation {
  id: string;
  degreePt: string;
  degreeEn: string;
  institution: string;
  year: number;
  orderIndex: number;
}

export interface PortfolioEvent {
  id: string;
  titlePt: string;
  titleEn: string;
  date: string;
  institution: string;
  slidesUrl: string | null;
}

export interface PortfolioPage {
  id: string;
  slug: string;
  titlePt: string;
  titleEn: string;
  contentPt: string | null;
  contentEn: string | null;
}

export interface PortfolioToolCategory {
  id: string;
  namePt: string;
  nameEn: string;
}

export interface PortfolioTool {
  id: string;
  name: string;
  descriptionPt: string;
  descriptionEn: string;
  url: string | null;
  icon: string | null;
  categories: PortfolioToolCategory[];
}

export const portfolioService = {
  // PROFILE
  async getProfile(): Promise<PortfolioProfile> {
    const res = await api.get('/portfolio/admin/profile');
    return res.data;
  },
  async updateProfile(data: Partial<PortfolioProfile>): Promise<PortfolioProfile> {
    const res = await api.put('/portfolio/admin/profile', data);
    return res.data;
  },
  async uploadAvatar(file: File): Promise<PortfolioProfile> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/portfolio/admin/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // INTERESTS
  async getInterests(): Promise<PortfolioInterest[]> {
    const res = await api.get('/portfolio/admin/interests');
    return res.data;
  },
  async createInterest(data: Partial<PortfolioInterest>): Promise<PortfolioInterest> {
    const res = await api.post('/portfolio/admin/interests', data);
    return res.data;
  },
  async updateInterest(id: string, data: Partial<PortfolioInterest>): Promise<PortfolioInterest> {
    const res = await api.put(`/portfolio/admin/interests/${id}`, data);
    return res.data;
  },
  async deleteInterest(id: string): Promise<void> {
    await api.delete(`/portfolio/admin/interests/${id}`);
  },

  // EDUCATION
  async getEducations(): Promise<PortfolioEducation[]> {
    const res = await api.get('/portfolio/admin/education');
    return res.data;
  },
  async createEducation(data: Partial<PortfolioEducation>): Promise<PortfolioEducation> {
    const res = await api.post('/portfolio/admin/education', data);
    return res.data;
  },
  async updateEducation(id: string, data: Partial<PortfolioEducation>): Promise<PortfolioEducation> {
    const res = await api.put(`/portfolio/admin/education/${id}`, data);
    return res.data;
  },
  async deleteEducation(id: string): Promise<void> {
    await api.delete(`/portfolio/admin/education/${id}`);
  },

  // EVENTS
  async getEvents(): Promise<PortfolioEvent[]> {
    const res = await api.get('/portfolio/admin/events');
    return res.data;
  },
  async createEvent(data: Partial<PortfolioEvent>): Promise<PortfolioEvent> {
    const res = await api.post('/portfolio/admin/events', data);
    return res.data;
  },
  async updateEvent(id: string, data: Partial<PortfolioEvent>): Promise<PortfolioEvent> {
    const res = await api.put(`/portfolio/admin/events/${id}`, data);
    return res.data;
  },
  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/portfolio/admin/events/${id}`);
  },

  // PAGES
  async getPages(): Promise<PortfolioPage[]> {
    const res = await api.get('/portfolio/admin/pages');
    return res.data;
  },
  async getPage(slug: string): Promise<PortfolioPage> {
    const res = await api.get(`/portfolio/admin/pages/${slug}`);
    return res.data;
  },
  async createPage(data: Partial<PortfolioPage>): Promise<PortfolioPage> {
    const res = await api.post('/portfolio/admin/pages', data);
    return res.data;
  },
  async updatePage(id: string, data: Partial<PortfolioPage>): Promise<PortfolioPage> {
    const res = await api.put(`/portfolio/admin/pages/${id}`, data);
    return res.data;
  },
  async deletePage(id: string): Promise<void> {
    await api.delete(`/portfolio/admin/pages/${id}`);
  },

  // TOOL CATEGORIES
  async getToolCategories(): Promise<PortfolioToolCategory[]> {
    const res = await api.get('/portfolio/admin/tool-categories');
    return res.data;
  },
  async createToolCategory(data: Partial<PortfolioToolCategory>): Promise<PortfolioToolCategory> {
    const res = await api.post('/portfolio/admin/tool-categories', data);
    return res.data;
  },
  async updateToolCategory(id: string, data: Partial<PortfolioToolCategory>): Promise<PortfolioToolCategory> {
    const res = await api.put(`/portfolio/admin/tool-categories/${id}`, data);
    return res.data;
  },
  async deleteToolCategory(id: string): Promise<void> {
    await api.delete(`/portfolio/admin/tool-categories/${id}`);
  },

  // TOOLS
  async getTools(): Promise<PortfolioTool[]> {
    const res = await api.get('/portfolio/admin/tools');
    return res.data;
  },
  async createTool(data: any): Promise<PortfolioTool> {
    const res = await api.post('/portfolio/admin/tools', data);
    return res.data;
  },
  async updateTool(id: string, data: any): Promise<PortfolioTool> {
    const res = await api.put(`/portfolio/admin/tools/${id}`, data);
    return res.data;
  },
  async deleteTool(id: string): Promise<void> {
    await api.delete(`/portfolio/admin/tools/${id}`);
  },

  // ==========================================
  // SURVEYS (Integração)
  // ==========================================
  async getPortfolioSurveys(): Promise<any[]> {
    const res = await api.get('/portfolio/admin/surveys');
    return res.data;
  },
  async toggleSurveyHighlight(id: string, isHighlighted: boolean): Promise<void> {
    await api.patch(`/portfolio/admin/surveys/${id}/highlight`, { isHighlighted });
  }
};

export const portfolioPublicApiService = {
  async getPortfolio(slug: string): Promise<any> {
    const res = await api.get(`/portfolio/public/${slug}`);
    return res.data;
  }
};
