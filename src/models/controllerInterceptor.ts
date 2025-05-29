import ExploreInterceptor from './exploreInterceptor';
import AdminInterceptor from './adminInterceptor';

class ControllerInterceptor {
  getInterceptor(url: string) {
    switch (true) {
      case ControllerInterceptor.isExploreDashboard(url):
        return new ExploreInterceptor();
      case ControllerInterceptor.isOverviewCopilot(url):
        return new AdminInterceptor(url);
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

  static isOverviewCopilot(url: string) {
    const allowedPatterns = [/^https:\/\/z3n.*\.zendesk\.com\/admin\/ai\/overview\/copilot$/];

    return allowedPatterns.some((pattern) => pattern.test(url));
  }

  static findActiveDashboard(configurationDashboards: any, dashboards: any, currentDashboard: any) {
    const activeDashboards = Object.entries(dashboards).filter(([id]) => configurationDashboards?.includes(id));

    const [_, activeDashboard] =
      (activeDashboards.find(([_, dashboard]: any) => {
        return dashboard.dashboardId === currentDashboard.id;
      }) as any) ?? [];

    return activeDashboard;
  }
}

export default ControllerInterceptor;
