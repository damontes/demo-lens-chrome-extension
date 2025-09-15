import ExploreInterceptor from './explore/interceptor';
import AdminInterceptor from './admin/interceptor';
import WFMInterceptor from './wfm/interceptor';

class ControllerInterceptor {
  getInterceptor(url: string) {
    switch (true) {
      case ControllerInterceptor.isExploreDashboard(url):
        return new ExploreInterceptor();
      case ControllerInterceptor.isOverviewCopilot(url):
        return new AdminInterceptor(url);
      case ControllerInterceptor.isWFM(url):
        return new WFMInterceptor();
      default:
        return null;
    }
  }

  static getInstanceInterceptor(url: string) {
    switch (true) {
      case ControllerInterceptor.isExploreDashboard(url):
        return ExploreInterceptor;
      case ControllerInterceptor.isOverviewCopilot(url):
        return AdminInterceptor;
      case ControllerInterceptor.isWFM(url):
        return WFMInterceptor;
      default:
        return null;
    }
  }

  static getInterceptorType(url: string) {
    switch (true) {
      case ControllerInterceptor.isExploreDashboard(url):
        return ExploreInterceptor.getDashboardType();
      case ControllerInterceptor.isOverviewCopilot(url):
        return AdminInterceptor.getDashboardType();
      case ControllerInterceptor.isWFM(url):
        return WFMInterceptor.getDashboardType();
      default:
        return null;
    }
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

  static isOverviewCopilot(url: string) {
    const allowedPatterns = [/^https:\/\/z3n.*\.zendesk\.com\/admin\/ai\/overview\/copilot$/];

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
}

export default ControllerInterceptor;
