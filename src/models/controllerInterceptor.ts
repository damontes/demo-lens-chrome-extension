import ExploreInterceptor from './explore/interceptor';
import AdminInterceptor from './admin/interceptor';
import WFMInterceptor from './wfm/interceptor';
import AIAgentsInterceptor from './aiagents/interceptor';

class ControllerInterceptor {
  getInterceptor(url: string) {
    switch (true) {
      case ControllerInterceptor.isExploreDashboard(url):
      case ControllerInterceptor.isLookerExploreDashboard(url):
        return new ExploreInterceptor();
      case ControllerInterceptor.isAdmin(url):
        return new AdminInterceptor(url);
      case ControllerInterceptor.isWFM(url):
        return new WFMInterceptor();
      case ControllerInterceptor.isAIAgents(url):
        return new AIAgentsInterceptor(url);
      default:
        return null;
    }
  }

  static getInstanceInterceptor(url: string) {
    switch (true) {
      case ControllerInterceptor.isExploreDashboard(url):
      case ControllerInterceptor.isLookerExploreDashboard(url):
        return ExploreInterceptor;
      case ControllerInterceptor.isAdmin(url):
        return AdminInterceptor;
      case ControllerInterceptor.isWFM(url):
        return WFMInterceptor;
      case ControllerInterceptor.isAIAgents(url):
        return AIAgentsInterceptor;
      default:
        return null;
    }
  }

  static getInterceptorType(url: string) {
    switch (true) {
      case ControllerInterceptor.isExploreDashboard(url):
      case ControllerInterceptor.isLookerExploreDashboard(url):
        return ExploreInterceptor.getDashboardType();
      case ControllerInterceptor.isAdmin(url):
        return AdminInterceptor.getDashboardType();
      case ControllerInterceptor.isWFM(url):
        return WFMInterceptor.getDashboardType();
      case ControllerInterceptor.isAIAgents(url):
        return AIAgentsInterceptor.getDashboardType();
      default:
        return null;
    }
  }

  static isLookerExploreDashboard(url: string) {
    return /^https:\/\/zendeskproduction(?:\w+).cloud.looker.com\/.*$/.test(url);
  }

  static isExploreDashboard(url: string) {
    const allowedPatterns = [
      /^https:\/\/z3n.*\.zendesk\.com\/explore\/dashboard\/.*$/,
      /^https:\/\/z3n.*\.zendesk\.com\/explore\/studio(?:[#?].*)?$/,
    ];

    return allowedPatterns.some((pattern) => pattern.test(url));
  }

  static isWFM(url: string) {
    const allowedPatterns = [/^https:\/\/z3n.*\.zendesk\.com\/wfm\/v2\/.*$/];

    return allowedPatterns.some((pattern) => pattern.test(url));
  }

  static isAdmin(url: string) {
    const allowedPatterns = [/^https:\/\/z3n.*\.zendesk\.com\/admin\/.*$/];

    return allowedPatterns.some((pattern) => pattern.test(url));
  }

  static isAIAgents(url: string) {
    const allowedPatterns = [
      /^https:\/\/dashboard(?:\.?\w)*.ultimate\.ai\/.*$/,
      /^https:\/\/aiagentsproduction(?:\w+).cloud.looker.com\/.*$/,
    ];

    return allowedPatterns.some((pattern) => pattern.test(url));
  }

  static findActiveDashboard(configurationDashboards: any, dashboards: any, condition: (dashboard: any) => boolean) {
    const activeDashboards = Object.entries(dashboards ?? {}).filter(([id]) => configurationDashboards?.includes(id));

    const [activeDashboardId, activeDashboard] =
      (activeDashboards.find(([_, dashboard]: any) => condition(dashboard)) as any) ?? [];

    if (!activeDashboardId) {
      return null;
    }

    return { ...activeDashboard, id: activeDashboardId };
  }

  /**
   * Gets the active template for the current dashboard
   * @param configurationDashboards - Array of active dashboard IDs
   * @param dashboards - Object containing all dashboards
   * @param templates - Object containing custom templates
   * @param predefinedTemplates - Array of predefined templates
   * @param dashboardType - The type of dashboard (e.g., 'admin', 'aiagents')
   * @returns The active template or null if not found
   */
  static getActiveTemplate(
    configurationDashboards: any[] | undefined,
    dashboards: any,
    templates: any,
    predefinedTemplates: any[],
    dashboardType: string,
  ): any | null {
    if (!configurationDashboards || !dashboards || !templates) {
      return null;
    }

    const activeDashboard = ControllerInterceptor.findActiveDashboard(
      configurationDashboards,
      dashboards,
      ({ type }) => type === dashboardType,
    );

    if (!activeDashboard) {
      return null;
    }

    let template = templates[activeDashboard.templateId];

    if (!template) {
      template = predefinedTemplates.find((t: any) => t.id === activeDashboard.templateId);
    }

    return template;
  }
}

export default ControllerInterceptor;
