import { faker } from '@faker-js/faker';
import { addDays, differenceInDays, endOfDay, startOfDay, subDays } from 'date-fns';
import { DashboardConfig, ForecastConfiguration, VolumeAdjustment } from './templates';
import { randInt } from '@/lib/general';

type Vertical = keyof typeof VERTICAL_DATA;

const DEFAULT_WORK_STREM_COLORS = ['#000871', '#5CD4C1', '#A7F68B', '#4FC4A8', '#5096EF', '#7855E1', '#2E7D32'];
const DEFAULT_GENERAL_TASK_COLORS = ['#FF6B35', '#F7931E', '#C5351B', '#722F37', '#5D737E', '#64403A', '#4A4E69'];
const TASK_TYPES = {
  generalTask: 'general_task',
  workstream: 'workstream',
};

const DEFAULT_TALK_STATUSES = ['available', 'unavailable', 'away', 'offline', 'no_change', 'transfers_only'];

// Industry-specific verticals with reduced options
export const VERTICAL_DATA = {
  finance: {
    agentGroups: ['Loan Officers', 'Credit Analysts', 'Customer Service', 'Fraud Detection', 'Compliance Team'],
    workstreams: [
      'Personal Loans',
      'Credit Cards',
      'Mortgages',
      'Investment Advice',
      'Account Management',
      'Fraud Alerts',
      'Regulatory Compliance',
    ],
    tasks: ['Credit Review', 'Loan Processing', 'Customer Consultation', 'Break', 'Launch'],
    locations: ['New York Branch', 'Chicago Office', 'Los Angeles Center', 'Miami Hub'],
    teams: [
      'Commercial Banking',
      'Retail Banking',
      'Investment Services',
      'Risk Management',
      'Compliance Division',
      'Customer Relations',
    ],
    organizations: ['First National Bank', 'Regional Credit Union', 'Investment Partners LLC'],
  },
  retail: {
    agentGroups: ['Sales Associates', 'Customer Support', 'Inventory Team', 'Returns Processing', 'Order Fulfillment'],
    workstreams: [
      'Online Orders',
      'In-Store Sales',
      'Returns & Exchanges',
      'Product Inquiries',
      'Inventory Management',
      'Shipping Support',
      'Customer Complaints',
    ],
    tasks: ['Order Processing', 'Customer Assistance', 'Inventory Check', 'Break', 'Launch'],
    locations: ['Main Store', 'Warehouse District', 'Shopping Mall', 'Distribution Center'],
    teams: [
      'Sales Floor',
      'Customer Service',
      'Inventory Management',
      'E-commerce',
      'Returns & Exchanges',
      'Store Operations',
    ],
    organizations: ['Retail Corp', 'Fashion Brands Inc', 'Electronics Plus'],
  },
  support: {
    agentGroups: ['Level 1 Support', 'Level 2 Support', 'Technical Specialists', 'Customer Success', 'Escalation Team'],
    workstreams: [
      'General Support',
      'Technical Issues',
      'Account Problems',
      'Feature Requests',
      'Bug Reports',
      'User Training',
      'Account Management',
    ],
    tasks: ['Ticket Resolution', 'Technical Troubleshooting', 'Customer Training', 'Break', 'Launch'],
    locations: ['Support Center A', 'Technical Hub', 'Customer Success Office', 'Remote Support Center'],
    teams: [
      'Tier 1 Support',
      'Technical Experts',
      'Customer Success',
      'Escalation Specialists',
      'Product Support',
      'Training Team',
    ],
    organizations: ['Support Solutions Inc', 'Tech Support Pro', 'Customer Care Corp'],
  },
  helpdesk: {
    agentGroups: ['IT Support', 'Help Desk Tier 1', 'Help Desk Tier 2', 'System Administrators', 'Field Support'],
    workstreams: [
      'Hardware Issues',
      'Software Problems',
      'Network Connectivity',
      'Password Resets',
      'Access Requests',
      'System Maintenance',
      'Equipment Setup',
    ],
    tasks: ['System Diagnosis', 'Password Reset', 'Software Installation', 'Break', 'Launch'],
    locations: ['IT Center', 'Data Center', 'Field Office', 'Remote Support Hub'],
    teams: ['Desktop Support', 'Network Team', 'Server Administration', 'Help Desk', 'Field Services', 'Security Team'],
    organizations: ['IT Services Ltd', 'Systems Integration Corp', 'Tech Solutions Inc'],
  },
  telecommunications: {
    agentGroups: ['Customer Care', 'Technical Support', 'Billing Support', 'Sales Team', 'Network Operations'],
    workstreams: [
      'Service Issues',
      'Billing Inquiries',
      'New Activations',
      'Plan Changes',
      'Network Problems',
      'Device Support',
      'Coverage Questions',
    ],
    tasks: ['Service Activation', 'Billing Resolution', 'Network Troubleshooting', 'Break', 'Launch'],
    locations: ['Call Center East', 'Technical Hub West', 'Customer Care Central', 'Network Operations Center'],
    teams: [
      'Customer Care',
      'Technical Support',
      'Billing Team',
      'Sales Division',
      'Network Operations',
      'Retention Specialists',
    ],
    organizations: ['Telecom Solutions Inc', 'Communications Corp', 'Mobile Network Ltd'],
  },
  healthcare: {
    agentGroups: [
      'Patient Services',
      'Insurance Specialists',
      'Appointment Coordinators',
      'Medical Records',
      'Billing Department',
    ],
    workstreams: [
      'Appointment Scheduling',
      'Insurance Verification',
      'Medical Records',
      'Billing Inquiries',
      'Prescription Requests',
      'Lab Results',
      'Referral Processing',
    ],
    tasks: ['Appointment Booking', 'Insurance Processing', 'Record Management', 'Break', 'Launch'],
    locations: ['Main Hospital', 'Outpatient Clinic', 'Medical Records Center', 'Patient Services Building'],
    teams: [
      'Patient Services',
      'Medical Records',
      'Insurance Processing',
      'Appointment Scheduling',
      'Billing Support',
      'Clinical Coordination',
    ],
    organizations: ['Healthcare System Inc', 'Medical Center Group', 'Patient Care Network'],
  },
  ecommerce: {
    agentGroups: ['Customer Service', 'Order Management', 'Payment Support', 'Shipping Team', 'Product Specialists'],
    workstreams: [
      'Order Support',
      'Payment Issues',
      'Shipping Inquiries',
      'Product Questions',
      'Return Processing',
      'Account Management',
      'Technical Support',
    ],
    tasks: ['Order Tracking', 'Payment Processing', 'Shipping Coordination', 'Break', 'Launch'],
    locations: ['Customer Service Center', 'Fulfillment Hub', 'Returns Processing Center', 'Technical Support Office'],
    teams: [
      'Customer Care',
      'Order Fulfillment',
      'Payment Processing',
      'Shipping Logistics',
      'Returns Team',
      'Product Support',
    ],
    organizations: ['E-Commerce Solutions Ltd', 'Online Retail Corp', 'Digital Marketplace Inc'],
  },
};

export const inflateAgentsPayload = (agentsNumber?: number) => {
  const numberOfAgents = agentsNumber || randInt(20, 35);

  const agents = Array.from({ length: numberOfAgents }, () => {
    const agentId = faker.number.int({ min: 10000000000000, max: 99999999999999 });
    return {
      id: agentId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      photo: faker.image.avatar(),
      userId: agentId,
      zendeskUserId: agentId,
      workstreamsIds: [],
      /** This can be injected for any record */
      groupId: 0,
      defaultGroupId: null,
      tymeshiftAccountId: 20543181, // This can be extracted
      locationId: '9d24bcab-2a7a-4e3f-968e-9bffbde27925',
      shiftTemplateId: '',
      teamId: null,
      teams: [],
      teamsIds: [],
      deactivated: false,
      isDeleted: false,
      roleId: '',
      locale: '',
    };
  });

  return agents;
};

export const inflateAgentGroupsPayload = (agents: any[], vertical: Vertical, lightAgentGroups?: any[]) => {
  const verticalData = getVertical(vertical);
  const groups = lightAgentGroups?.length ? lightAgentGroups : verticalData.agentGroups;
  const agentsPerGroup = Math.floor(agents.length / groups.length);
  const agentIds = agents.map((a) => a.id);

  const agentGroups = groups.map((group, index) => {
    // If it's a light payload item, use its id and name directly
    const groupId = typeof group === 'object' ? group.id : faker.number.int({ min: 1000000, max: 9999999 });
    const groupName = typeof group === 'object' ? group.name : group;

    return {
      id: groupId,
      zendGroupId: faker.number.int({ min: 10000000000000, max: 99999999999999 }),
      tymeshiftAccountId: 20543181,
      agentsIds: agentIds.slice(index * agentsPerGroup, (index + 1) * agentsPerGroup),
      name: groupName,
      deleted: 0,
      isDeleted: false,
    };
  });

  return agentGroups;
};

export const inflateWorkstreamsPayload = (
  agents: any[],
  vertical: Vertical,
  lightWorkstreams?: any[],
  forecastConfig?: ForecastConfiguration,
) => {
  const verticalData = getVertical(vertical);
  const workstreamNames = lightWorkstreams?.length ? lightWorkstreams : verticalData.workstreams;

  const baseWorkstreams = workstreamNames.map((workstreamItem, index) => {
    // If it's a light payload item, use its id and name directly
    const workstreamId = typeof workstreamItem === 'object' ? workstreamItem.id : faker.string.uuid();
    const workstreamName = typeof workstreamItem === 'object' ? workstreamItem.name : workstreamItem;

    const agentsIds = agents.map((a) => a.id);

    return {
      id: workstreamId,
      name: workstreamName,
      description: faker.lorem.sentence(),
      color: DEFAULT_WORK_STREM_COLORS[index],
      visible: true,
      agentsIds,
      conditions: {
        id: faker.string.uuid(),
        workstreamId: workstreamId,
        tymeshiftAccountId: 20543181,
        contactMethodKeys: faker.helpers.arrayElements(
          ['all_ticket_via_types', 'all_chat_via_types', 'all_voice_via_types', 'mail', 'web_form'],
          randInt(1, 2),
        ),
        all: [],
        any: [],
      },
      order: index + 1,
      tymeshiftAccountId: 20543181,
      contactMethodGroup: 'ticket',
      isDeleted: false,
      priority: faker.number.int({ min: 1, max: 100 }),
      // Add forecast algorithm fields with default values
      forecastAlgorithm: 'automatic',
      actualAlgorithm: null,
      // Add other missing forecast-related fields
      importedHistoricalVolume: false,
      useAllZendeskData: true,
      ignoreDataPriorToDate: null,
      excludeInboundVolumeOutliers: false,
      deletedAt: null,
      inboundVolumeAdjustments: [],
      inboundVolumeOutliers: [],
    };
  });

  if (!forecastConfig) {
    return baseWorkstreams;
  }

  // Add complete forecast configuration to each workstream with full nested structure
  return baseWorkstreams.map((workstream, index) => ({
    ...workstream,
    // Override forecast algorithm from config
    forecastAlgorithm: forecastConfig.algorithm.name,
    actualAlgorithm: null,
    // Basic forecast properties
    importedHistoricalVolume: false,
    useAllZendeskData: true,
    ignoreDataPriorToDate: null,
    excludeInboundVolumeOutliers: false,
    deletedAt: null,
    inboundVolumeAdjustments: forecastConfig.volumeAdjustments,
    inboundVolumeOutliers: forecastConfig.excludedOutliers,
    // Complete fullTimeEquivalent object matching original structure
    fullTimeEquivalent: {
      id: faker.string.uuid(),
      channel: forecastConfig.staffingParameters.channel,
      maxOccupancyRate: forecastConfig.staffingParameters.maxOccupancyRate,
      averageHandleTime: forecastConfig.staffingParameters.averageHandleTime,
      averageHandleTimeType: 'static',
      targetTime: 14400,
      shrinkage: forecastConfig.staffingParameters.shrinkage,
      targetServiceLevel: forecastConfig.staffingParameters.targetServiceLevel,
      availability: false,
      availabilityHours: [],
      availabilityTimezone: null,
      minimumStaffing: forecastConfig.staffingParameters.minimumStaffing,
      concurrency: forecastConfig.staffingParameters.concurrency,
      workstreamId: workstream.id,
      scenarioId: workstream.id,
      tymeshiftAccountId: 20543181,
    },
    // Complete forecastScenario object matching original simple structure
    forecastScenario: {
      id: workstream.id, // Use same ID as workstream
      name: 'Default Scenario',
      workstreamId: workstream.id,
      startDate: null,
      endDate: null,
      isActive: true,
      isDefault: true,
      forecastAlgorithm: forecastConfig.algorithm.name,
      fullTimeEquivalent: null,
      inboundVolumeAdjustments: null,
      inboundVolumeOutliers: null,
      useAllZendeskData: true,
      ignoreDataPriorToDate: null,
      importedHistoricalVolume: false,
    },
  }));
};

// Helper function to convert time string (HH:MM) to seconds since midnight
const convertTimeToSeconds = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 3600 + minutes * 60;
};

export const inflateTasksPayload = (workstreams: any[], vertical: Vertical, lightTasks?: any[]) => {
  const verticalData = getVertical(vertical);
  const taskNames = lightTasks?.length ? lightTasks : verticalData.tasks;

  const [startIndex, endIndex] = randomRange(workstreams.length);
  const permittedWorkstreamIds = workstreams.map((w) => w.id).slice(startIndex, endIndex);

  const tasks = taskNames.map((taskItem, index) => {
    // If it's a light payload item, use its id and name directly
    const taskId = typeof taskItem === 'object' ? taskItem.id : faker.string.uuid();
    const taskName = typeof taskItem === 'object' ? taskItem.name : taskItem;

    return {
      id: taskId,
      type: 'general_task',
      name: taskName,
      description: '',
      jobId: faker.number.int({ min: 1000000000000000, max: 9999999999999999 }),
      color: DEFAULT_GENERAL_TASK_COLORS[index],
      excludeOccupancy: true,
      productiveTime: false,
      permittedWorkstreamIds,
      permittedWorkstreamIdsWithoutScoping: permittedWorkstreamIds,
      permittedWorkstreamPreset: [],
      talkStatus: faker.helpers.arrayElement(DEFAULT_TALK_STATUSES),
      isPaid: faker.datatype.boolean(),
      isDeleted: false,
      zendeskAgentStatusId: null,
      channels: {
        messaging: null,
        support: null,
        talk: null,
      },
      taskMeta: {
        isDefault: false,
        taskType: null,
      },
      deletedAt: null,
    };
  });

  return tasks;
};

// Light versions for ScheduleForm initialization based on industry
export const lightInflateAgentGroupsPayload = (vertical: Vertical) => {
  const verticalData = getVertical(vertical);

  return verticalData.agentGroups.map((groupName) => ({
    id: faker.number.int({ min: 1000000, max: 9999999 }),
    name: groupName,
  }));
};

export const lightInflateWorkstreamsPayload = (vertical: Vertical) => {
  const verticalData = getVertical(vertical);

  return verticalData.workstreams.map((workstreamName) => ({
    id: faker.string.uuid(),
    name: workstreamName,
  }));
};

export const lightInflateTasksPayload = (vertical: Vertical) => {
  const verticalData = getVertical(vertical);

  return verticalData.tasks.map((taskName) => ({
    id: faker.string.uuid(),
    name: taskName,
  }));
};

export const inflateShiftsPayload = (
  startDate: string,
  endDate: string,
  agents: any[],
  workstreams: any[],
  tasks: any[],
) => {
  const startDateTime = startOfDay(subDays(new Date(startDate), 1));
  const endDateTime = endOfDay(addDays(new Date(endDate), 1));
  const differenceOfDays = differenceInDays(endDateTime, startDateTime);

  const agentShifts: any[] = [];

  agents.forEach((agent, idx) => {
    let currentDate = startDateTime.getTime();

    // Check if this agent should reuse previous agent's shift pattern (every 3rd agent starting from index 1)
    const shouldReusePattern = idx > 0 && idx % 3 !== 0;
    const previousAgentShifts = shouldReusePattern ? agentShifts[idx - 1] : null;

    const shifts = Array.from({ length: differenceOfDays + 1 }, (_, dayIndex) => {
      if (shouldReusePattern && previousAgentShifts) {
        const previousShift = previousAgentShifts.shifts[dayIndex];
        if (previousShift) {
          // Reuse the timing from previous shift but with different workstreams
          const shift = generateShift(
            currentDate,
            agent,
            workstreams,
            tasks,
            previousShift.startTime,
            previousShift.endTime,
          );
          currentDate = shift.endTime * 1000;
          return shift;
        }
      }

      // Generate new shift for first agent in group or fallback
      const shift = generateShift(currentDate, agent, workstreams, tasks);
      currentDate = shift.endTime * 1000;
      return shift;
    });

    agentShifts.push({
      id: agent.id,
      shifts,
    });
  });

  return agentShifts;
};

export const generateShiftsForecast = (
  workstreams: any,
  generalTasks: any,
  startTime: number,
  length: number,
  step: number,
) => {
  return Array.from({ length }, (_, i) => ({
    interval: startTime + i * step,
    workstreams: workstreams.map((workstream: any) => ({
      id: workstream.id,
      count: randInt(5, 20), // Random count for each workstream
    })),
    generalTasks: generalTasks.map((task: any) => ({
      id: task.id,
      count: Number((Math.random() * 3).toFixed(2)),
    })),
    timeOffs: [],
  }));
};

function getVertical(vertical: Vertical) {
  return VERTICAL_DATA[vertical];
}

function getShiftTopology(type?: string) {
  switch (type) {
    default:
      return [
        TASK_TYPES.workstream,
        'Break', // Specific task name
        TASK_TYPES.workstream,
        TASK_TYPES.workstream,
        'Launch', // Specific task name
        TASK_TYPES.workstream,
        'Break', // Specific task name
        TASK_TYPES.workstream,
      ];
  }
}

function getTaskTypeFromTopologyItem(topologyItem: string) {
  // If it's one of our known task types, return it
  if (Object.values(TASK_TYPES).includes(topologyItem as any)) {
    return topologyItem;
  }

  // If it's a specific task name, it's a general task
  return TASK_TYPES.generalTask;
}

function selectTaskFromTopology(
  topologyItem: string,
  selectedWorkstreams: any[],
  selectedTasks: any[],
  index: number,
  totalItems: number,
) {
  // If it's a workstream type, select from workstreams
  if (topologyItem === TASK_TYPES.workstream) {
    return faker.helpers.arrayElement(selectedWorkstreams);
  }

  // If it's a specific task name, find that exact task
  if (topologyItem !== TASK_TYPES.generalTask) {
    const specificTask = selectedTasks.find((task) => task.name.toLowerCase() === topologyItem.toLowerCase());
    if (specificTask) {
      return specificTask;
    }
  }

  // If it's general task type or specific task not found, use smart selection
  return selectAppropriateGeneralTask(selectedTasks, index, totalItems);
}

function getTaskDuration(taskType: string, taskName?: string) {
  const options = Array.from({ length: 3 }, (_, idx) => 3600 + 1800 * idx);

  if (taskType === TASK_TYPES.generalTask) {
    // Specific durations for different general task types
    if (taskName) {
      const taskNameLower = taskName.toLowerCase();
      if (taskNameLower.includes('lunch') || taskNameLower.includes('launch')) {
        return 3600; // 1 hour
      }
      if (taskNameLower.includes('break')) {
        return 900; // 15 minutes
      }
    }
    // Default for other general tasks
    return faker.helpers.arrayElement([1800, 3600]);
  }

  return faker.helpers.arrayElement(options);
}

function selectAppropriateGeneralTask(selectedTasks: any[], shiftPosition: number, totalShiftTasks: number) {
  // Filter tasks by type based on position in shift
  const lunchTasks = selectedTasks.filter(
    (task) => task.name.toLowerCase().includes('lunch') || task.name.toLowerCase().includes('launch'),
  );
  const breakTasks = selectedTasks.filter((task) => task.name.toLowerCase().includes('break'));
  const otherTasks = selectedTasks.filter(
    (task) =>
      !task.name.toLowerCase().includes('lunch') &&
      !task.name.toLowerCase().includes('launch') &&
      !task.name.toLowerCase().includes('break'),
  );

  // Middle of shift (around lunch time) - prefer lunch tasks
  const isMiddleOfShift =
    shiftPosition >= Math.floor(totalShiftTasks / 2) - 1 && shiftPosition <= Math.floor(totalShiftTasks / 2) + 1;

  if (isMiddleOfShift && lunchTasks.length > 0) {
    return faker.helpers.arrayElement(lunchTasks);
  }

  // Other positions - prefer breaks first, then other tasks
  if (breakTasks.length > 0) {
    // 70% chance to pick a break for non-lunch positions
    if (Math.random() < 0.7) {
      return faker.helpers.arrayElement(breakTasks);
    }
  }

  // If no breaks or random chose otherwise, pick other tasks
  if (otherTasks.length > 0) {
    return faker.helpers.arrayElement(otherTasks);
  }

  // Fallback to any available task
  return faker.helpers.arrayElement(selectedTasks);
}

function randomRange(total: number, length = 3) {
  const startIndex = randInt(0, total - length);
  const endIndex = startIndex + length;

  return [startIndex, endIndex];
}

function generateShift(
  startDate: any,
  agent: any,
  workstreams: any,
  tasks: any,
  fixedStartTime?: number,
  fixedEndTime?: number,
  topologyType?: string,
) {
  const [startWorkstreamIndex, endWorkstreamIndex] = randomRange(workstreams.length, 4);

  const selectedWorkstreams = workstreams.slice(startWorkstreamIndex, endWorkstreamIndex);
  const selectedTasks = tasks.slice(-2);

  const shift = getShiftTopology(topologyType);

  const shiftId = faker.string.uuid();

  // Use fixed times if provided, otherwise calculate from startDate
  let startTime: number;
  let totalDuration: number;

  if (fixedStartTime !== undefined && fixedEndTime !== undefined) {
    startTime = fixedStartTime;
    totalDuration = fixedEndTime - fixedStartTime;
  } else {
    const baseStartTime = startDate / 1000;
    const timeOffset = 13 * 3600;
    startTime = baseStartTime + timeOffset;
    // Calculate total duration from shift tasks
    totalDuration = shift.reduce((total, topologyItem, index) => {
      const taskType = getTaskTypeFromTopologyItem(topologyItem);

      if (taskType === TASK_TYPES.generalTask) {
        // For general tasks, estimate duration based on specific task or position
        if (topologyItem !== TASK_TYPES.generalTask) {
          // It's a specific task name, use specific duration
          const estimatedDuration = getTaskDuration(taskType, topologyItem);
          return total + estimatedDuration;
        } else {
          // It's generic general task, estimate based on position
          const isMiddleOfShift =
            index >= Math.floor(shift.length / 2) - 1 && index <= Math.floor(shift.length / 2) + 1;
          const estimatedDuration = isMiddleOfShift ? 3600 : 900;
          return total + estimatedDuration;
        }
      } else {
        const duration = getTaskDuration(taskType);
        return total + duration;
      }
    }, 0);
  }

  const shiftTasks = shift.reduce((prev, topologyItem, index) => {
    const taskType = getTaskTypeFromTopologyItem(topologyItem);

    // Select the appropriate task based on topology specification
    let task: any = selectTaskFromTopology(topologyItem, selectedWorkstreams, selectedTasks, index, shift.length);

    // Get the previous task to avoid consecutive duplicates
    const previousTask = prev.at(-1);
    if (previousTask && task.name === previousTask.name) {
      if (taskType === TASK_TYPES.generalTask) {
        const availableTasks = selectedTasks.filter((t: any) => t.name !== previousTask.name);
        if (availableTasks.length > 0) {
          task = selectTaskFromTopology(topologyItem, selectedWorkstreams, availableTasks, index, shift.length);
        }
      } else {
        const availableWorkstreams = selectedWorkstreams.filter((w: any) => w.name !== previousTask.name);
        if (availableWorkstreams.length > 0) {
          task = faker.helpers.arrayElement(availableWorkstreams);
        }
      }
    }

    const { id, name, color } = task;

    let duration: number;
    if (fixedStartTime !== undefined && fixedEndTime !== undefined) {
      // For fixed shifts, still respect specific task durations for breaks/lunch
      if (taskType === TASK_TYPES.generalTask && name) {
        const specificDuration = getTaskDuration(taskType, name);
        // Check if this is a break or lunch with specific duration
        const taskNameLower = name.toLowerCase();
        if (taskNameLower.includes('break') || taskNameLower.includes('lunch')) {
          duration = specificDuration;
        } else {
          // For other general tasks, distribute remaining time
          duration = Math.floor(totalDuration / shift.length);
        }
      } else {
        // For workstreams, distribute the total time evenly across tasks
        duration = Math.floor(totalDuration / shift.length);
      }
    } else {
      // Use task-specific duration based on task name and type
      duration = getTaskDuration(taskType, name);
    }

    const previousEndTime = prev.at(-1)?.endTime ?? 0;

    return [
      ...prev,
      {
        id: faker.string.uuid(),
        startTime: previousEndTime,
        endTime: previousEndTime + duration,
        name,
        color,
        shiftId,
        taskableId: id,
        taskableType: taskType,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        note: null,
        tymeshiftAccountId: 20543181,
      },
    ];
  }, [] as any);

  const workstreamTasks = shiftTasks.filter((task: any) => task.taskableType === TASK_TYPES.workstream);
  const generalTasksInShift = shiftTasks.filter((task: any) => task.taskableType === TASK_TYPES.generalTask);
  const endTime = fixedEndTime !== undefined ? fixedEndTime : startTime + shiftTasks.at(-1)?.endTime;

  return {
    id: shiftId,
    tymeshiftAccountId: 20543181,
    agentId: agent.id,
    startTime,
    endTime,
    workstreams: workstreamTasks,
    generalTasks: generalTasksInShift,
    published: true,
    parentId: null,
    scheduleId: faker.string.uuid(),
    tasks: shiftTasks,
  };
}

export const inflateAgentActivitiesPayload = (
  agents: any[],
  workstreams: any[],
  configuration: {
    workingHours: { start: string; end: string };
    activitiesPerAgent: { min: number; max: number };
    activityDuration: { min: number; max: number };
    untrackedActivityPercentage: number;
    untrackedDuration: { min: number; max: number };
  },
  startDate: string,
  endDate: string,
) => {
  // Safety checks
  if (!agents || !Array.isArray(agents) || agents.length === 0) {
    return [];
  }

  if (!startDate || typeof startDate !== 'string') {
    startDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  if (!configuration) {
    configuration = {
      workingHours: { start: '09:00', end: '17:00' },
      activitiesPerAgent: { min: 25, max: 50 }, // Increased to better fill 8-hour shifts
      activityDuration: { min: 5, max: 15 }, // Changed from 15-120 to 5-15 minutes
      untrackedActivityPercentage: 5, // Reduced since we have scheduled breaks
      untrackedDuration: { min: 3, max: 15 }, // Changed from 10-60 to 3-15 minutes
    };
  }

  // Define multiple start times for different shifts
  const SHIFT_START_TIMES = [
    { start: '08:00', end: '16:00' }, // Early shift
    { start: '09:00', end: '17:00' }, // Regular shift
    { start: '10:00', end: '18:00' }, // Late morning shift
    { start: '12:00', end: '20:00' }, // Afternoon shift
  ];

  // Create agent groups of 3-4 agents each that share the same shift and workstreams
  const AGENTS_PER_GROUP = 4;
  const agentGroups: any[] = [];

  for (let i = 0; i < agents.length; i += AGENTS_PER_GROUP) {
    const groupAgents = agents.slice(i, i + AGENTS_PER_GROUP);
    const groupIndex = Math.floor(i / AGENTS_PER_GROUP);

    // Assign the same shift to all agents in this group
    const shiftSchedule = SHIFT_START_TIMES[groupIndex % SHIFT_START_TIMES.length];

    // Assign the same 2-3 workstreams to all agents in this group
    const maxWorkstreamsPerGroup = randInt(1, Math.min(2, workstreams.length));
    const groupWorkstreams = workstreams
      .sort(() => 0.5 - Math.random()) // Shuffle once for the group
      .slice(0, maxWorkstreamsPerGroup);

    agentGroups.push({
      agents: groupAgents,
      shift: shiftSchedule,
      workstreams: groupWorkstreams,
    });
  }

  const result: any[] = [];

  // Process each group
  agentGroups.forEach((group) => {
    group.agents.forEach((agent: any) => {
      const { shift: shiftSchedule, workstreams: agentWorkstreams } = group;

      const activities: any[] = [];

      // Parse shift working hours (use group's shift schedule)
      const [startHour, startMinute] = shiftSchedule.start.split(':').map(Number);
      const [endHour, endMinute] = shiftSchedule.end.split(':').map(Number);

      // Create base date from startDate and add working hours
      const [year, month, day] = startDate.split('-').map(Number);
      const baseDate = new Date(year, month - 1, day); // month is 0-indexed

      if (isNaN(baseDate.getTime())) {
        return [];
      }

      const workingDayStart = new Date(baseDate);
      workingDayStart.setHours(startHour, startMinute, 0, 0);

      const workingDayEnd = new Date(baseDate);
      workingDayEnd.setHours(endHour, endMinute, 0, 0);

      // Convert to Unix timestamps (seconds)
      let currentTimestamp = Math.floor(workingDayStart.getTime() / 1000);
      const workingDayEndTimestamp = Math.floor(workingDayEnd.getTime() / 1000);

      let ticketIdCounter = 92000 + randInt(1, 999); // Start with a realistic ticket ID

      // First, schedule breaks/lunch periods (exactly 2 per shift)
      const breakSchedule: Array<{ startTime: number; duration: number; name: string }> = [];
      const shiftDurationHours = 8;
      const numberOfBreaks = 2; // Exactly 2 breaks per shift

      // All breaks are 30 minutes
      const breakDuration = 30 * 60; // 30 minutes in seconds

      for (let i = 0; i < numberOfBreaks; i++) {
        // Schedule exactly 2 breaks during the shift
        let breakStartTime: number;
        if (i === 0) {
          // First break: 2-3 hours into shift
          breakStartTime = currentTimestamp + randInt(2 * 3600, 3 * 3600);
        } else {
          // Lunch break: 4.5-5.5 hours into shift
          breakStartTime = currentTimestamp + randInt(4.5 * 3600, 5.5 * 3600);
        }

        const breakName = 'Untracked';

        // Ensure break doesn't exceed working day
        if (breakStartTime + breakDuration <= workingDayEndTimestamp) {
          breakSchedule.push({
            startTime: breakStartTime,
            duration: breakDuration,
            name: breakName,
          });
        }
      }

      // Sort breaks by start time
      breakSchedule.sort((a, b) => a.startTime - b.startTime);

      // Generate activities to fill the entire shift duration
      let breakIndex = 0;
      let untrackedCount = 0; // Track total untracked activities (max 3)
      const maxUntrackedActivities = 3;

      while (currentTimestamp < workingDayEndTimestamp) {
        // Check if we should insert a break now
        if (breakIndex < breakSchedule.length && currentTimestamp >= breakSchedule[breakIndex].startTime - 60) {
          // Within 1 minute of break time

          const breakData = breakSchedule[breakIndex];

          // Add the break activity
          const breakActivity = {
            id: faker.string.uuid(),
            ticketId: 0,
            startTime: breakData.startTime,
            endTime: breakData.startTime + breakData.duration,
            duration: breakData.duration,
            userId: agent.id,
            agentId: agent.id,
            workstreams: [],
            type: 'untracked',
            eventType: 'clock_in',
            name: breakData.name,
            color: '#fa5251',
            isPaid: false,
            generalTaskId: null,
            lockIntervals: null,
          };

          activities.push(breakActivity);
          untrackedCount++; // Count scheduled breaks as untracked
          currentTimestamp = breakData.startTime + breakData.duration;
          breakIndex++;

          // Add small gap after break
          const gap = randInt(5, 15);
          if (currentTimestamp + gap < workingDayEndTimestamp) {
            currentTimestamp += gap;
          }
          continue;
        }

        // Regular activity generation
        // Only allow random untracked if we haven't reached the maximum
        const canAddUntracked = untrackedCount < maxUntrackedActivities;
        const isUntracked = canAddUntracked && Math.random() * 100 < configuration.untrackedActivityPercentage / 3;

        let duration: number;
        if (isUntracked) {
          duration = randInt(3, 15) * 60;
          untrackedCount++; // Count random untracked activities
        } else {
          duration = randInt(5, 15) * 60;
        }

        // Check if this activity would conflict with the next scheduled break
        if (breakIndex < breakSchedule.length) {
          const nextBreak = breakSchedule[breakIndex];
          const maxDuration = nextBreak.startTime - currentTimestamp - 60; // Leave 1 minute buffer

          if (maxDuration > 0 && duration > maxDuration) {
            duration = Math.max(maxDuration, 300); // At least 5 minutes
          } else if (maxDuration <= 300) {
            // Too close to break, jump to break time
            currentTimestamp = nextBreak.startTime;
            continue;
          }
        }

        // Ensure we don't exceed working hours
        if (currentTimestamp + duration > workingDayEndTimestamp) {
          duration = workingDayEndTimestamp - currentTimestamp;
        }

        // Skip if there's no meaningful time left
        if (duration < 180) {
          // Less than 3 minutes
          break;
        }

        // Select workstream from the agent's assigned workstreams only
        const selectedWorkstream =
          agentWorkstreams.length > 0 ? agentWorkstreams[randInt(0, agentWorkstreams.length - 1)] : null;

        const activity = {
          id: faker.string.uuid(),
          ticketId: isUntracked ? 0 : ticketIdCounter++,
          startTime: currentTimestamp,
          endTime: currentTimestamp + duration,
          duration: duration,
          userId: agent.id,
          agentId: agent.id,
          workstreams: isUntracked ? [] : selectedWorkstream ? [selectedWorkstream] : [],
          type: isUntracked ? 'untracked' : 'ticket',
          eventType: 'clock_in',
          name: isUntracked ? 'Untracked' : selectedWorkstream?.name || 'Ticket Work',
          color: isUntracked ? '#fa5251' : selectedWorkstream?.color || '#8a5bea',
          isPaid: true,
          generalTaskId: null,
          lockIntervals: null,
        };

        activities.push(activity);
        currentTimestamp += duration;

        // Add small random gap between activities (5-15 seconds) only if there's enough time left
        const gap = randInt(5, 15);
        if (currentTimestamp + gap < workingDayEndTimestamp) {
          currentTimestamp += gap;
        }
      }

      result.push({
        id: agent.id,
        activities: activities,
      });
    });
  });

  return result;
};

export const inflateForecastActualPayload = (
  startDate: string,
  endDate: string,
  workstreamsIds: string[],
  interval: 'hour' | '15minutes' | '30minutes' = 'hour',
  configuration?: {
    currentTimeIndex?: number; // What index represents "now" for actual data
    baseTicketVolume?: { min: number; max?: number };
    baseScheduledAgents?: { min: number; max?: number };
    slaTarget?: number; // Target SLA percentage
    includeWeekends?: boolean; // Whether to include weekend data
  },
) => {
  // Default configuration with simplified settings
  const config = {
    currentTimeIndex: configuration?.currentTimeIndex ?? (interval === 'hour' ? 8 : interval === '30minutes' ? 16 : 32),
    baseTicketVolume: {
      min: configuration?.baseTicketVolume?.min ?? 40,
      max:
        configuration?.baseTicketVolume?.max ??
        (configuration?.baseTicketVolume?.min ? configuration.baseTicketVolume.min + 45 : 85),
    },
    baseRequiredAgents: { min: 15, max: 30 }, // Keep as reasonable defaults
    baseScheduledAgents: {
      min: configuration?.baseScheduledAgents?.min ?? 50,
      max:
        configuration?.baseScheduledAgents?.max ??
        (configuration?.baseScheduledAgents?.min ? configuration.baseScheduledAgents.min + 110 : 160),
    },
    slaTarget: configuration?.slaTarget ?? 90,
    forecastVariance: 25, // Keep reasonable default
    actualVariance: 30, // Keep reasonable default
    includeWeekends: configuration?.includeWeekends ?? true,
    businessHours: { start: 7, end: 19 }, // Keep reasonable default
  };

  // Parse date range - compensate for platform treating timestamps as UTC
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
  const baseStartDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0); // Local 00:00:00

  // Get timezone offset in milliseconds and compensate for platform UTC interpretation
  const timezoneOffsetMs = baseStartDate.getTimezoneOffset() * 60 * 1000;
  const adjustedStartDate = new Date(baseStartDate.getTime() + timezoneOffsetMs);
  const adjustedEndDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

  if (isNaN(adjustedStartDate.getTime()) || isNaN(adjustedEndDate.getTime())) {
    return [];
  }

  const result: any[] = [];

  // Use adjusted dates for calculations
  const baseStartDateForCalc = adjustedStartDate;
  const baseEndDateForCalc = adjustedEndDate;

  // Calculate interval parameters
  let totalIntervals: number;
  let intervalDuration: number; // in milliseconds
  let intervalsPerDay: number;

  switch (interval) {
    case '15minutes':
      intervalDuration = 15 * 60 * 1000;
      intervalsPerDay = 96; // 24 * 4
      break;
    case '30minutes':
      intervalDuration = 30 * 60 * 1000;
      intervalsPerDay = 48; // 24 * 2
      break;
    case 'hour':
    default:
      intervalDuration = 60 * 60 * 1000;
      intervalsPerDay = 24;
      break;
  }

  // Calculate total intervals spanning the date range
  // For intraday intervals (hour, 30minutes, 15minutes), calculate based on single day
  if (startDate === endDate) {
    // Same day - generate intervals for 24 hours
    totalIntervals = intervalsPerDay;
  } else {
    // Multiple days - calculate total intervals across all days
    const totalDays =
      Math.ceil((baseEndDateForCalc.getTime() - baseStartDateForCalc.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    totalIntervals = totalDays * intervalsPerDay;
  }

  // Generate realistic patterns based on interval type and time
  const getPatternMultipliers = (currentInterval: number) => {
    const currentDate = new Date(baseStartDateForCalc.getTime() + currentInterval * intervalDuration);
    const dayOfWeek = currentDate.getDay(); // Use local day
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Intraday patterns (hour, 30minutes, 15minutes)
    const hour = currentDate.getHours(); // Use local hours
    const minute = currentDate.getMinutes(); // Use local minutes

    // Weekend adjustment
    const weekendMultiplier = isWeekend && !config.includeWeekends ? 0.2 : isWeekend ? 0.6 : 1.0;

    // Business hours check
    const isBusinessHour = hour >= config.businessHours.start && hour < config.businessHours.end;
    const businessMultiplier = isBusinessHour ? 1.0 : 0.3;

    // Hour-based patterns
    let hourPattern = { forecastMultiplier: 0.3, actualMultiplier: 0.2, staffingMultiplier: 0.8 };
    if (hour >= 7 && hour < 12)
      hourPattern = { forecastMultiplier: 0.8, actualMultiplier: 0.9, staffingMultiplier: 1.0 };
    else if (hour >= 12 && hour < 14)
      hourPattern = { forecastMultiplier: 1.2, actualMultiplier: 1.1, staffingMultiplier: 0.7 };
    else if (hour >= 14 && hour < 18)
      hourPattern = { forecastMultiplier: 1.0, actualMultiplier: 1.0, staffingMultiplier: 1.2 };
    else if (hour >= 18 && hour < 22)
      hourPattern = { forecastMultiplier: 0.6, actualMultiplier: 0.4, staffingMultiplier: 0.9 };

    // Sub-hour patterns for finer intervals
    let subHourMultiplier = 1.0;
    if (interval === '15minutes' || interval === '30minutes') {
      // Peak activity in first half of hour, slight dip in second half
      subHourMultiplier = minute < 30 ? 1.1 : 0.9;
    }

    return {
      forecastMultiplier: hourPattern.forecastMultiplier * weekendMultiplier * businessMultiplier * subHourMultiplier,
      actualMultiplier: hourPattern.actualMultiplier * weekendMultiplier * businessMultiplier * subHourMultiplier,
      staffingMultiplier: hourPattern.staffingMultiplier * weekendMultiplier * businessMultiplier,
    };
  };

  for (let i = 0; i < totalIntervals; i++) {
    const currentDate = new Date(baseStartDateForCalc.getTime() + i * intervalDuration);
    const timestamp = Math.floor(currentDate.getTime() / 1000);

    const pattern = getPatternMultipliers(i);

    // Base numbers from configuration
    const baseForecasted = randInt(config.baseTicketVolume.min, config.baseTicketVolume.max);
    const baseRequired = randInt(config.baseRequiredAgents.min, config.baseRequiredAgents.max);
    const baseScheduled = randInt(config.baseScheduledAgents.min, config.baseScheduledAgents.max);

    // Calculate values with patterns and variance
    const forecastedTickets = Math.max(0, Math.floor(baseForecasted * pattern.forecastMultiplier));
    const shortTermForecastTickets = Math.max(
      0,
      Math.floor(forecastedTickets * (1 + randInt(-config.forecastVariance, config.forecastVariance) / 100)),
    );

    // Determine if this is a "past" interval (has actual data)
    const isPastInterval = i < config.currentTimeIndex;
    const actualTickets = isPastInterval
      ? Math.max(
          0,
          Math.floor(
            forecastedTickets *
              pattern.actualMultiplier *
              (1 + randInt(-config.actualVariance, config.actualVariance) / 100),
          ),
        )
      : null;

    const requiredAgents = Math.max(0, Math.floor(baseRequired * pattern.staffingMultiplier));
    const scheduledAgents = Math.max(0, Math.floor(baseScheduled * pattern.staffingMultiplier));
    const actualAgents = isPastInterval
      ? Math.max(0, actualTickets === 0 ? randInt(0, 5) : Math.floor(scheduledAgents * (1 + randInt(-40, 20) / 100)))
      : null;

    // Calculate derived metrics
    const shortTermVsActualNetTickets = isPastInterval ? shortTermForecastTickets - (actualTickets || 0) : null;
    const requiredVsActualStaffing = isPastInterval ? requiredAgents - (actualAgents || 0) : null;

    // AHT (Average Handle Time) in seconds - varies by interval
    const forecastedAht = 557; // Fixed baseline
    const actualAht = isPastInterval ? (actualTickets === 0 ? null : randInt(35, 2150)) : null;

    // SLA metrics - only when there are actual tickets
    let actualSla = null;
    let metSla = null;
    let missedSla = null;

    if (isPastInterval && actualTickets && actualTickets > 0) {
      actualSla = randInt(Math.max(60, config.slaTarget - 10), Math.min(99, config.slaTarget + 5));
      metSla = Math.floor((actualTickets * actualSla) / 100);
      missedSla = actualTickets - metSla;
    }

    result.push({
      timestamp,
      forecastedTickets,
      shortTermForecastTickets,
      actualTickets,
      requiredAgents,
      scheduledAgents,
      actualAgents,
      shortTermVsActualNetTickets,
      requiredVsActualStaffing,
      forecastedAht,
      actualAht,
      actualSla,
      metSla,
      missedSla,
    });
  }

  return result;
};

// Forecast-specific data generation functions

/**
 * Generate realistic volume time series data based on forecast configuration
 */
export const generateVolumeForecastData = (
  workstreamId: string,
  config: ForecastConfiguration,
  startDate: Date,
  endDate: Date,
  timePeriodType?: string,
): Array<{
  timestamp: number;
  workstreamId: string;
  volumeForecast: number;
  intervalMinutes: number;
}> => {
  const result = [];
  const algorithm = config.algorithm;

  // Calculate interval duration in minutes based on time period type
  let intervalMinutes: number;

  if (timePeriodType) {
    // Auto-select frequency based on time period for optimal data visualization
    // Based on real Zendesk WFM API behavior
    switch (timePeriodType) {
      case 'day':
        intervalMinutes = 15; // 15-minute intervals for daily view (96 points)
        break;
      case 'week':
        intervalMinutes = 51; // ~51-minute intervals for weekly view (198 points)
        break;
      case 'month':
        intervalMinutes = 1440; // Daily intervals for monthly view (30 points)
        break;
      case 'year':
        intervalMinutes = 10080; // Weekly intervals for yearly view (52 points)
        break;
      default:
        // Fall back to configuration frequency
        intervalMinutes = algorithm.frequency === '15 min' ? 15 : algorithm.frequency === 'hourly' ? 60 : 1440;
        break;
    }
  } else {
    // Use original configuration frequency
    intervalMinutes = algorithm.frequency === '15 min' ? 15 : algorithm.frequency === 'hourly' ? 60 : 1440; // daily
  }

  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const intervalMs = intervalMinutes * 60 * 1000;

  // Base volume patterns with industry-specific characteristics
  const getIndustryVolumePattern = (category: string, staffingParams: any) => {
    const channel = staffingParams.channel;
    const avgHandleTime = staffingParams.averageHandleTime;

    // Finance: Higher complexity, longer calls, business hours focused
    if (avgHandleTime >= 900 && channel === 'phone') {
      // Finance characteristics
      return {
        hourlyPattern: [
          0.1, 0.05, 0.05, 0.1, 0.3, 0.8, 1.4, 1.6, 1.8, 1.6, 1.4, 1.2, 1.0, 1.2, 1.4, 1.6, 1.4, 1.0, 0.6, 0.3, 0.2,
          0.1, 0.05, 0.05,
        ],
        baseMultiplier: 1.8, // Higher base volume
        weekendReduction: 0.1, // Much lower on weekends
        variability: 0.4, // Higher variability
      };
    }
    // E-commerce: High volume, quick interactions, 24/7 activity
    else if (avgHandleTime <= 600 && (channel === 'email' || channel === 'chat')) {
      // E-commerce characteristics
      return {
        hourlyPattern: [
          0.4, 0.3, 0.2, 0.3, 0.5, 0.8, 1.1, 1.3, 1.4, 1.3, 1.2, 1.1, 1.0, 1.1, 1.2, 1.4, 1.5, 1.3, 1.1, 0.9, 0.7, 0.6,
          0.5, 0.4,
        ],
        baseMultiplier: 2.2, // Very high base volume
        weekendReduction: 0.7, // Still active on weekends
        variability: 0.6, // Very high variability
      };
    }
    // Retail: Moderate volume, seasonal patterns, customer service focused
    else if (channel === 'chat' || (avgHandleTime >= 400 && avgHandleTime <= 800)) {
      // Retail characteristics
      return {
        hourlyPattern: [
          0.2, 0.1, 0.1, 0.2, 0.4, 0.7, 1.0, 1.2, 1.3, 1.4, 1.5, 1.4, 1.2, 1.3, 1.4, 1.5, 1.3, 1.0, 0.8, 0.6, 0.4, 0.3,
          0.2, 0.2,
        ],
        baseMultiplier: 1.4, // Moderate base volume
        weekendReduction: 0.8, // Weekend shopping
        variability: 0.3, // Moderate variability
      };
    }
    // Healthcare: Steady volume, emergency patterns, extended hours
    else if (staffingParams.targetServiceLevel >= 0.95) {
      // Healthcare characteristics (high SLA)
      return {
        hourlyPattern: [
          0.6, 0.5, 0.4, 0.5, 0.6, 0.8, 1.0, 1.1, 1.2, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.6,
          0.6, 0.6,
        ],
        baseMultiplier: 1.6, // High consistent volume
        weekendReduction: 0.9, // Healthcare doesn't stop
        variability: 0.2, // More predictable
      };
    }
    // Default/Generic pattern
    else {
      return {
        hourlyPattern: [
          0.3, 0.2, 0.2, 0.3, 0.5, 0.7, 1.0, 1.2, 1.3, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, 1.1, 0.9, 0.7, 0.5, 0.4, 0.3,
          0.3, 0.3,
        ],
        baseMultiplier: 1.0,
        weekendReduction: 0.5,
        variability: 0.25,
      };
    }
  };

  const industryPattern = getIndustryVolumePattern(algorithm.category, config.staffingParameters);

  // Base volume varies by industry pattern and workstream
  const workstreamHash = workstreamId.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  const workstreamVariation = Math.abs(workstreamHash) % 30; // 0-29 variation

  const baseVolume = Math.round(
    (algorithm.category === 'ai' ? 45 : algorithm.category === 'machine_learning' ? 35 : 25) *
      industryPattern.baseMultiplier +
      workstreamVariation,
  );

  for (let timestamp = startTime; timestamp < endTime; timestamp += intervalMs) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    // Get industry-specific hourly multiplier with workstream variation
    const hourlyMultiplier = industryPattern.hourlyPattern[hour] || 1.0;

    // Add workstream-specific pattern variation
    const workstreamPatternVariation = ((workstreamHash % 40) - 20) / 100; // -0.2 to +0.2
    const adjustedHourlyMultiplier = Math.max(
      0.05,
      hourlyMultiplier * (1 + workstreamPatternVariation * industryPattern.variability),
    );

    // Weekend adjustment based on industry
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? industryPattern.weekendReduction : 1.0;

    // Calculate base forecast with industry patterns
    let forecastVolume = baseVolume * adjustedHourlyMultiplier * weekendMultiplier;

    // Apply volume adjustments
    config.volumeAdjustments.forEach((adjustment: VolumeAdjustment) => {
      if (adjustment.active && timestamp >= adjustment.startTime && timestamp <= adjustment.endTime) {
        if (adjustment.changeType === 'percentage') {
          forecastVolume *= 1 + adjustment.change / 100;
        } else {
          forecastVolume += adjustment.change;
        }
      }
    });

    // Add algorithm-specific variance
    const variance =
      algorithm.category === 'ai'
        ? randInt(-8, 8)
        : algorithm.category === 'machine_learning'
        ? randInt(-12, 12)
        : randInt(-18, 18);

    forecastVolume = Math.max(0, Math.floor(forecastVolume * (1 + variance / 100)));

    result.push({
      timestamp,
      workstreamId,
      volumeForecast: forecastVolume,
      intervalMinutes,
    });
  }

  return result;
};

/**
 * Generate staffing forecast data based on volume and configuration
 */
export const generateStaffingForecastData = (
  workstreamId: string,
  volumeData: Array<{ timestamp: number; volumeForecast: number; intervalMinutes?: number }>,
  config: ForecastConfiguration,
): Array<{
  timestamp: number;
  workstreamId: string;
  requiredFTE: number;
  scheduledFTE: number;
  occupancyRate: number;
  serviceLevel: number;
}> => {
  const staffingParams = config.staffingParameters;

  return volumeData.map(({ timestamp, volumeForecast, intervalMinutes }) => {
    // Calculate required FTE based on volume and handle time
    // Use intervalMinutes from volume data if available, otherwise fall back to config frequency
    let intervalHours: number;

    if (intervalMinutes) {
      intervalHours = intervalMinutes / 60;
    } else {
      intervalHours = config.algorithm.frequency === '15 min' ? 0.25 : config.algorithm.frequency === 'hourly' ? 1 : 24;
    }

    const workMinutesNeeded = (volumeForecast * staffingParams.averageHandleTime) / 60;
    const workHoursNeeded = workMinutesNeeded / 60;

    // Apply shrinkage and occupancy
    const effectiveWorkHours = workHoursNeeded / (1 - staffingParams.shrinkage) / staffingParams.maxOccupancyRate;
    const requiredFTE = Math.max(staffingParams.minimumStaffing, effectiveWorkHours / intervalHours);

    // Scheduled FTE (usually slightly higher than required)
    const scheduledFTE = Math.max(requiredFTE, (requiredFTE * randInt(105, 120)) / 100);

    // Calculate actual occupancy and service level
    const actualOccupancy = Math.min(staffingParams.maxOccupancyRate, requiredFTE / scheduledFTE);

    // Service level depends on staffing adequacy
    const staffingRatio = scheduledFTE / requiredFTE;
    let serviceLevel = staffingParams.targetServiceLevel;

    if (staffingRatio < 0.9) {
      serviceLevel *= 0.7; // Under-staffed
    } else if (staffingRatio < 0.95) {
      serviceLevel *= 0.85; // Slightly under-staffed
    } else if (staffingRatio > 1.1) {
      serviceLevel = Math.min(0.99, serviceLevel * 1.05); // Over-staffed
    }

    return {
      timestamp,
      workstreamId,
      requiredFTE: Math.round(requiredFTE * 100) / 100,
      scheduledFTE: Math.round(scheduledFTE * 100) / 100,
      occupancyRate: Math.round(actualOccupancy * 100) / 100,
      serviceLevel: Math.round(serviceLevel * 100) / 100,
    };
  });
};

/**
 * Generate complete forecast payload for all workstreams
 */
export const inflateForecastPayload = (
  workstreams: any[],
  forecastConfig: ForecastConfiguration,
  startDate: Date,
  endDate: Date,
) => {
  const volumeForecasts: Array<{
    timestamp: number;
    workstreamId: string;
    volumeForecast: number;
    intervalMinutes: number;
  }> = [];

  const staffingForecasts: Array<{
    timestamp: number;
    workstreamId: string;
    requiredFTE: number;
    scheduledFTE: number;
    occupancyRate: number;
    serviceLevel: number;
  }> = [];

  workstreams.forEach((workstream) => {
    // Generate volume forecast
    const volumeData = generateVolumeForecastData(workstream.id, forecastConfig, startDate, endDate);

    // Generate staffing forecast
    const staffingData = generateStaffingForecastData(workstream.id, volumeData, forecastConfig);

    volumeForecasts.push(...volumeData);
    staffingForecasts.push(...staffingData);
  });

  return {
    volumeForecasts,
    staffingForecasts,
    configuration: {
      algorithm: forecastConfig.algorithm,
      totalVolumeAdjustments: forecastConfig.volumeAdjustments.length,
      totalExcludedOutliers: forecastConfig.excludedOutliers.length,
      staffingParameters: forecastConfig.staffingParameters,
    },
  };
};

// Helper function to get metric type
function getMetricType(metricKey: string): string {
  if (metricKey.includes('rate') || metricKey.includes('percentage')) {
    return 'percentage';
  } else if (metricKey.includes('time') || metricKey.includes('duration')) {
    return 'duration';
  } else {
    return 'number';
  }
}

// Helper function to generate realistic metric values
function generateMetricValue(metricKey: string, level: string, existingActivities?: any[], config?: any): number {
  // Use config to modify generation if available
  const performanceMultiplier = config?.performanceMultiplier || 1;
  const variationRange = config?.variationRange || 1;

  switch (metricKey) {
    case 'adherence-rate':
      return Math.random() * 100 * performanceMultiplier;
    case 'assigned-point':
    case 'attend-point':
    case 'escalate-point':
    case 'reopen-point':
    case 'solved-point':
      return randInt(0, (level === 'agent' ? 100 : 20) * performanceMultiplier);
    case 'paid-time':
    case 'total-time':
      return randInt(0, level === 'agent' ? 28800 : 3600); // 8 hours max for agent, 1 hour for others
    case 'scheduled-time':
      return level === 'agent' ? 28800 : 3600; // 8 hours for agents, 1 hour for intervals
    case 'paid-general-task-time':
    case 'unpaid-general-task-time':
      return randInt(0, 3600 * variationRange); // Up to 1 hour, affected by variation
    case 'average-handle-time':
      return randInt(300, 1800); // 5-30 minutes
    case 'occupancy-rate':
    case 'utilization-rate':
    case 'resolution-rate':
    case 'ticket-solved-rate':
    case 'ticket-bounce-rate':
      return Math.random() * 100 * performanceMultiplier;
    case 'ticket-time':
      // If we have actual activities, sum up ticket time
      if (existingActivities && level === 'agent') {
        const ticketTime = existingActivities.reduce((total: number, activity: any) => {
          if (activity.workstreamId) {
            return total + (activity.endTime - activity.startTime);
          }
          return total;
        }, 0);
        return ticketTime > 0 ? ticketTime : randInt(3600, 25200); // 1-7 hours fallback
      }
      return randInt(3600, 25200); // 1-7 hours
    case 'productive-time':
      return randInt(21600, 28800 * performanceMultiplier); // 6-8 hours, affected by performance
    case 'unproductive-time':
      return randInt(0, 7200 / performanceMultiplier); // 0-2 hours, inversely affected by performance
    case 'untracked-time':
      return randInt(0, 3600); // 0-1 hour
    default:
      return randInt(0, 100 * performanceMultiplier);
  }
}

// Main report summary generation function
export const inflateReportSummaryPayload = ({
  template,
  startDate,
  endDate,
  selectedGroupingIds,
  currentDashboard,
}: {
  template: any; // Full template object with all configuration
  startDate: string;
  endDate: string;
  selectedGroupingIds: any[];
  currentDashboard: any; // Whole dashboard object with all configuration
}) => {
  const { agents, activities, configuration } = currentDashboard;
  const { schedule, reports: reportsConfig } = configuration;
  const { workstreams, agentGroups, tasks } = schedule;

  const activityId = `${startDate}:${endDate}`;
  const existingActivities = activities?.[activityId];

  // Extract configuration from the actual template
  const { dimensions, metrics } = template;

  if (!dimensions || !metrics) {
    console.warn('Template missing dimensions or metrics:', template);
    return [];
  }

  const { groupBy, ticketCustomField } = dimensions;

  if (!groupBy || !Array.isArray(groupBy)) {
    console.warn('Template missing valid groupBy configuration:', template);
    return [];
  }

  // If no selectedGroupingIds, return root level data
  if (!selectedGroupingIds || selectedGroupingIds.length === 0) {
    const rootGroupByKey = groupBy[0];
    if (!rootGroupByKey) {
      console.warn('No root groupBy key found:', groupBy);
      return [];
    }

    // For base case, show metrics only if this is the only level
    // OR if this is the target level (which is level 0 when no selectedGroupingIds)
    const isLeafLevel = true; // Always show metrics at the first level when no drilling down

    return generateLevelData({
      groupByKey: rootGroupByKey,
      metrics,
      agents,
      workstreams,
      agentGroups,
      tasks,
      startDate,
      endDate,
      existingActivities,
      isLeafLevel: isLeafLevel,
      reportsConfig,
      currentDashboard,
      ticketCustomField,
    });
  }

  // For hierarchical drill-down, build the nested structure
  // Follow the path specified by selectedGroupingIds
  const buildNestedPath = (currentLevel: number): any[] => {
    if (currentLevel >= selectedGroupingIds.length) {
      // We've reached the selected level, generate the next level data
      const nextGroupByKey = groupBy[selectedGroupingIds.length];
      if (!nextGroupByKey) {
        // No more levels, return empty
        return [];
      }

      // Check if this is the target level that should show metrics
      // Metrics appear at the level immediately after selectedGroupingIds length
      const targetLevel = selectedGroupingIds.length; // This is the level we want to show metrics at
      const isLeafLevel = true; // Always show metrics at the target level

      return generateLevelData({
        groupByKey: nextGroupByKey,
        metrics,
        agents,
        workstreams,
        agentGroups,
        tasks,
        startDate,
        endDate,
        existingActivities,
        isLeafLevel, // Always show metrics at the target level
        reportsConfig,
        currentDashboard,
      });
    }

    // Get the current level data
    const currentGroupByKey = groupBy[currentLevel];
    const selectedId = selectedGroupingIds[currentLevel];

    const currentLevelData = generateLevelData({
      groupByKey: currentGroupByKey,
      metrics,
      agents,
      workstreams,
      agentGroups,
      tasks,
      startDate,
      endDate,
      existingActivities,
      isLeafLevel: false, // Parent levels never show metrics
      reportsConfig,
      currentDashboard,
    });

    // Find the matching item for this level
    const matchingItem = currentLevelData.find(
      (item: any) => item.itemValue == selectedId || String(item.itemValue) === String(selectedId),
    );

    if (!matchingItem) {
      console.warn(`No matching item found for selectedGroupingId: ${selectedId} at level ${currentLevel}`);
      return [];
    }

    // Recursively build children for the next level
    const children = buildNestedPath(currentLevel + 1);

    return [
      {
        ...matchingItem,
        metrics: null, // Parent levels always have null metrics
        children,
      },
    ];
  };

  return buildNestedPath(0);
};

// Generate real WFM metrics that match the actual API response
function generateRealMetrics(metricKeys: string[], existingActivities?: any[], config?: ReportsConfiguration): any[] {
  return metricKeys.map((key) => generateRealMetric(key, config));
}

// Reports Configuration Interface
interface ReportsConfiguration {
  performanceLevel: 'low' | 'average' | 'high' | 'excellent'; // 0.7, 1.0, 1.2, 1.4 multipliers
  adherenceTarget: number; // 0.8-0.98 - affects adherence metrics
  efficiencyLevel: 'low' | 'average' | 'high'; // affects handle times and response times
  qualityTarget: number; // 0.7-0.95 - affects resolution rates and bounce rates
  workloadIntensity: 'light' | 'moderate' | 'heavy' | 'peak'; // affects volume metrics
  productiveTimePercentage: number; // 0.6-0.9 - affects time distribution
}

// WFM Metrics Configuration - labels and formats only
// TODO: This should be replaced with dynamic configuration from https://z3n-daniel.zendesk.com/wfm/l5/api/reports/configuration
// when intercepting requests to https://z3n-daniel.zendesk.com/wfm/v2/reports
const WFM_METRICS_CONFIG = {
  'adherence-rate': { label: 'Adherence rate', format: 'percentage' },
  'assigned-point': { label: 'Assigned points', format: 'number' },
  'attend-point': { label: 'Attended points', format: 'number' },
  'average-handle-time': { label: 'Average handle time', format: 'duration' },
  'escalate-point': { label: 'Escalated points', format: 'number' },
  'first-response-time': { label: 'First response time', format: 'duration' },
  'first-response-time-after-assignment': { label: 'First response time after assignment', format: 'duration' },
  'handle-point': { label: 'Handled points', format: 'number' },
  'in-adherence-time': { label: 'In adherence time', format: 'duration' },
  'number-of-tickets-touched': { label: 'Number of tickets touched', format: 'number' },
  'touched-ticket-count': { label: 'Number of unique tickets with time spent', format: 'number' },
  'occupancy-rate': { label: 'Occupancy rate', format: 'percentage' },
  'out-of-adherence-time': { label: 'Out of adherence time', format: 'duration' },
  'paid-general-task-time': { label: 'Paid General Task time', format: 'duration' },
  'paid-time': { label: 'Paid time', format: 'duration' },
  'private-comments': { label: 'Private comments', format: 'number' },
  'productive-general-task-time': { label: 'Productive General Task time', format: 'duration' },
  'productive-time': { label: 'Productive time', format: 'duration' },
  'public-comments': { label: 'Public comments', format: 'number' },
  'reopen-point': { label: 'Reopened points', format: 'number' },
  'resolution-rate': { label: 'Resolution rate', format: 'percentage' },
  'solved-point': { label: 'Solved points', format: 'number' },
  'solved-points-per-paid-hour': { label: 'Solved points per paid hour', format: 'number' },
  'solved-points-per-productive-hour': { label: 'Solved points per productive hour', format: 'number' },
  'ticket-bounce-points': { label: 'Ticket bounce points', format: 'number' },
  'ticket-bounce-rate': { label: 'Ticket bounce rate', format: 'percentage' },
  'ticket-solved-rate': { label: 'Ticket solved rate', format: 'percentage' },
  'ticket-time': { label: 'Ticket time', format: 'duration' },
  'total-time': { label: 'Total time', format: 'duration' },
  'unpaid-general-task-time': { label: 'Unpaid General Task time', format: 'duration' },
  'unproductive-general-task-time': { label: 'Unproductive General Task time', format: 'duration' },
  'unproductive-time': { label: 'Unproductive time', format: 'duration' },
  'untracked-time': { label: 'Untracked time', format: 'duration' },
  'utilization-rate': { label: 'Utilization rate', format: 'percentage' },
};

// Generate metric value with configuration-based modifiers
function generateRealMetricValue(metricKey: string, config?: ReportsConfiguration): number {
  // Default configuration if none provided
  const defaultConfig: ReportsConfiguration = {
    performanceLevel: 'average',
    adherenceTarget: 0.85,
    efficiencyLevel: 'average',
    qualityTarget: 0.8,
    workloadIntensity: 'moderate',
    productiveTimePercentage: 0.75,
  };

  const cfg = config || defaultConfig;

  // Performance multipliers
  const performanceMultipliers = { low: 0.7, average: 1.0, high: 1.2, excellent: 1.4 };
  const efficiencyMultipliers = { low: 1.4, average: 1.0, high: 0.7 }; // Lower is better for times
  const workloadMultipliers = { light: 0.6, moderate: 1.0, heavy: 1.4, peak: 1.8 };

  const performanceMult = performanceMultipliers[cfg.performanceLevel];
  const efficiencyMult = efficiencyMultipliers[cfg.efficiencyLevel];
  const workloadMult = workloadMultipliers[cfg.workloadIntensity];

  switch (metricKey) {
    // Adherence metrics - affected by adherenceTarget
    case 'adherence-rate':
      return Math.round((cfg.adherenceTarget * 100 + randInt(-10, 5)) * 10) / 10;
    case 'in-adherence-time':
      return Math.round(cfg.adherenceTarget * 28800 + randInt(-3600, 1800)); // Base 8hrs * adherence
    case 'out-of-adherence-time':
      return Math.round((1 - cfg.adherenceTarget) * 7200 + randInt(-1800, 1800)); // Inverse of adherence

    // Quality metrics - affected by qualityTarget and performanceLevel
    case 'resolution-rate':
    case 'ticket-solved-rate':
      return Math.round((cfg.qualityTarget * 100 * performanceMult + randInt(-5, 5)) * 10) / 10;
    case 'ticket-bounce-rate':
      return Math.round(((1 - cfg.qualityTarget) * 30 + randInt(-5, 5)) * 10) / 10; // Inverse quality

    // Efficiency metrics - affected by efficiencyLevel
    case 'average-handle-time':
    case 'first-response-time':
    case 'first-response-time-after-assignment':
      return Math.round(randInt(300, 1800) * efficiencyMult);

    // Performance points - affected by performanceLevel and workload
    case 'assigned-point':
    case 'attend-point':
    case 'handle-point':
    case 'solved-point':
      return Math.round(randInt(20, 100) * performanceMult * workloadMult);
    case 'escalate-point':
    case 'reopen-point':
      return Math.round(randInt(0, 50) * (2 - performanceMult)); // Inverse performance

    // Volume metrics - affected by workloadIntensity
    case 'number-of-tickets-touched':
    case 'touched-ticket-count':
      return Math.round(randInt(10, 50) * workloadMult);
    case 'private-comments':
    case 'public-comments':
      return Math.round(randInt(5, 20) * workloadMult);
    case 'ticket-bounce-points':
      return Math.round(randInt(0, 30) * (2 - performanceMult));

    // Productivity metrics - affected by productiveTimePercentage
    case 'productive-time':
      return Math.round(28800 * cfg.productiveTimePercentage + randInt(-3600, 1800));
    case 'unproductive-time':
      return Math.round(28800 * (1 - cfg.productiveTimePercentage) + randInt(-1800, 1800));
    case 'paid-time':
    case 'total-time':
      return randInt(25200, 28800); // 7-8 hours
    case 'ticket-time':
      return Math.round(randInt(14400, 25200) * cfg.productiveTimePercentage); // 4-7 hours * productivity

    // Task time distribution
    case 'paid-general-task-time':
    case 'productive-general-task-time':
      return randInt(1800, 7200); // 0.5-2 hours
    case 'unpaid-general-task-time':
    case 'unproductive-general-task-time':
      return randInt(0, 3600); // 0-1 hour
    case 'untracked-time':
      return Math.round(randInt(900, 3600) * (2 - performanceMult)); // Less untracked = better performance

    // Rate metrics
    case 'occupancy-rate':
    case 'utilization-rate':
      return Math.round((0.6 + (performanceMult - 1) * 0.2 + Math.random() * 0.3) * 100 * 10) / 10;

    // Productivity ratios
    case 'solved-points-per-paid-hour':
    case 'solved-points-per-productive-hour':
      return Math.round(randInt(3, 10) * performanceMult * 10) / 10;

    default:
      return randInt(0, 100);
  }
}

// Generate metric with configuration support
function generateRealMetric(metricKey: string, config?: ReportsConfiguration) {
  const metricConfig = WFM_METRICS_CONFIG[metricKey as keyof typeof WFM_METRICS_CONFIG];

  if (metricConfig) {
    return {
      key: metricKey,
      value: generateRealMetricValue(metricKey, config),
      type: metricConfig.format,
    };
  }

  // Fallback for unknown metrics
  return {
    key: metricKey,
    value: randInt(0, 1000),
    type: 'number',
  };
}

// Single dynamic level data generation function
function generateLevelData({
  groupByKey,
  metrics,
  agents,
  workstreams,
  agentGroups,
  tasks,
  startDate,
  endDate,
  existingActivities,
  isLeafLevel = false,
  reportsConfig,
  currentDashboard,
  ticketCustomField,
}: {
  groupByKey: string;
  metrics: string[];
  agents: any[];
  workstreams: any[];
  agentGroups?: any[];
  tasks?: any[];
  startDate?: string;
  endDate?: string;
  existingActivities?: any[];
  isLeafLevel?: boolean;
  reportsConfig?: ReportsConfiguration;
  currentDashboard?: any;
  ticketCustomField?: number;
}) {
  // Generate items based on groupBy key
  const items = getItemsForGroupBy({
    groupByKey,
    agents,
    workstreams,
    tasks: tasks || [],
    agentGroups: agentGroups || [],
    locations: currentDashboard?.configuration?.schedule?.locations || [],
    teams: currentDashboard?.configuration?.schedule?.teams || [],
    organizations: currentDashboard?.configuration?.schedule?.organizations || [],
    customFields: currentDashboard?.customFields || [],
    ticketCustomField,
    startDate,
    endDate,
  });

  // Generate metrics for each item - only for leaf level
  return items.map((item: any) => {
    const generatedMetrics = isLeafLevel ? generateRealMetrics(metrics, existingActivities, reportsConfig) : null;

    return {
      itemKey: item.itemKey,
      itemValue: item.value,
      metrics: generatedMetrics,
      children: null,
    };
  });
}

// Get items based on groupBy key
function getItemsForGroupBy({
  groupByKey,
  agents,
  workstreams,
  tasks,
  agentGroups,
  locations,
  teams,
  organizations,
  customFields,
  ticketCustomField,
  startDate,
  endDate,
}: {
  groupByKey: string;
  agents: any[];
  workstreams: any[];
  tasks: any[];
  agentGroups: any[];
  locations: any[];
  teams: any[];
  organizations: any[];
  customFields?: any[];
  ticketCustomField?: number;
  startDate?: string;
  endDate?: string;
}) {
  switch (groupByKey) {
    case 'agent_id':
      return agents.map((agent) => ({
        itemKey: 'agent',
        value: agent.id,
      }));

    case 'interval':
      if (!startDate || !endDate) return [];

      const start = new Date(startDate);
      const end = new Date(endDate);

      const daysDiff = differenceInDays(end, start);

      const maxDays = Math.min(daysDiff + 1, 10);

      const intervals = [];
      for (let i = 0; i < maxDays; i++) {
        const currentDate = addDays(start, i);
        const timestamp = Math.floor(currentDate.getTime() / 1000);
        intervals.push({
          itemKey: 'timeDay',
          value: timestamp,
        });
      }
      return intervals;

    case 'activity_type':
      const activities: { itemKey: string; value: string }[] = [];

      const maxTasks = randInt(1, 2);
      const limitedTasks = tasks.slice(0, maxTasks);

      limitedTasks.forEach((task) => {
        activities.push({
          itemKey: 'activity_type_general_task',
          value: task.jobId,
        });
      });

      const maxWorkstreams = randInt(3, 4);
      const limitedWorkstreams = workstreams.slice(0, maxWorkstreams);

      limitedWorkstreams.forEach((w) => {
        activities.push({
          itemKey: 'activity_type_ticket',
          value: w.id,
        });
      });

      return activities;

    case 'team':
      return teams.map((team) => ({
        itemKey: 'team',
        value: team.id,
      }));

    case 'location':
      return locations.map((location) => ({
        itemKey: 'location',
        value: location.id,
      }));

    case 'organization_id':
      return organizations.map((organization) => ({
        itemKey: 'organization_id',
        value: organization.id,
      }));

    case 'group_id':
      return agentGroups.map((group) => ({
        itemKey: 'group',
        value: group.id,
      }));

    case 'ticket_id':
      const ticketCount = randInt(5, 15);
      return Array.from({ length: ticketCount }, (_, i) => ({
        itemKey: 'ticketId',
        value: `${90000 + randInt(1000, 9999)}`,
      }));

    case 'status':
      return [
        { itemKey: 'ticketStatus', value: 'new' },
        { itemKey: 'ticketStatus', value: 'open' },
        { itemKey: 'ticketStatus', value: 'pending' },
        { itemKey: 'ticketStatus', value: 'solved' },
        { itemKey: 'ticketStatus', value: 'closed' },
      ];

    case 'via':
      return [
        { itemKey: 'via', value: 'email' },
        { itemKey: 'via', value: 'web' },
        { itemKey: 'via', value: 'chat' },
        { itemKey: 'via', value: 'phone' },
        { itemKey: 'via', value: 'api' },
        { itemKey: 'via', value: 'mobile' },
      ];

    case 'ticket_custom_field':
      const selectedCustomField = customFields?.find((field) => field.key === ticketCustomField);

      if (!selectedCustomField) {
        return [];
      }

      return selectedCustomField.options.map((option: any) => ({
        itemKey: 'ticket_custom_field_id_and_option_key',
        value: `${ticketCustomField}.${option.key}`,
      }));

    default:
      console.warn(`Unsupported groupBy key: ${groupByKey}`);
      return [];
  }
}

export const inflateLocationsPayload = (agents: any[], vertical: Vertical, lightLocations?: any[]) => {
  const verticalData = getVertical(vertical);
  const locations = lightLocations?.length ? lightLocations : verticalData.locations || [];

  return locations.map((locationName, index) => ({
    id: faker.string.uuid(),
    name: locationName,
    timezone: faker.location.timeZone(),
    operationalHours: [],
    isTwentyFourSeven: Math.random() > 0.5,
    tymeshiftAccountId: randInt(10000000, 99999999),
    agents: randInt(0, agents.length),
    schedulingRules: {
      consecutiveWorkDays: {
        min: randInt(4, 5),
        max: randInt(5, 6),
      },
      consecutiveDaysOff: {
        min: randInt(1, 2),
        max: randInt(2, 3),
      },
      workHoursPerWeek: {
        min: randInt(20, 30),
        max: randInt(35, 45),
      },
      numberOfHoursBetweenShifts: randInt(8, 16),
      specificDaysOffEnabled: Math.random() > 0.5,
      daysOff: ['saturday', 'sunday'],
      weeks: randInt(1, 4),
      recurrence: randInt(1, 3),
      locationId: faker.string.uuid(),
    },
    deletedAt: null,
    isDeleted: false,
  }));
};

export const inflateTeamsPayload = (agents: any[], vertical: Vertical, lightTeams?: any[]) => {
  const verticalData = getVertical(vertical);
  const teams = lightTeams?.length ? lightTeams : verticalData.teams || [];

  return teams.map((teamName, index) => {
    const teamAgents = agents.slice(
      index * Math.floor(agents.length / teams.length),
      (index + 1) * Math.floor(agents.length / teams.length),
    );

    return {
      id: faker.string.uuid(),
      name: teamName,
      description: `${teamName} team handling specialized operations`,
      tymeshiftAccountId: randInt(10000, 99999),
      managerId: teamAgents[0]?.id || randInt(10000000000000, 99999999999999),
      agentsIds: teamAgents.map((agent) => agent.id),
      deletedAt: null,
      isDeleted: false,
    };
  });
};

export const inflateOrganizationsPayload = (vertical: Vertical, lightOrganizations?: any[]) => {
  const verticalData = getVertical(vertical);
  const organizations = lightOrganizations?.length ? lightOrganizations : verticalData.organizations || [];

  return organizations.map((orgName, index) => ({
    id: randInt(10000000000000, 99999999999999),
    name: orgName,
    isDeleted: false,
  }));
};

const generateDashboardMetricValue = (
  metricName: string,
  performanceLevel: 'low' | 'average' | 'high' | 'excellent',
  responseType: 'number' | 'time' | 'percentage',
  volumeIntensity: 'light' | 'moderate' | 'heavy' | 'peak',
  responseSpeed: 'urgent' | 'fast' | 'normal' | 'extended',
) => {
  const multiplier = {
    low: 0.7,
    average: 1.0,
    high: 1.2,
    excellent: 1.4,
  }[performanceLevel];

  const volumeMultiplier = {
    light: 0.6,
    moderate: 1.0,
    heavy: 1.5,
    peak: 2.2,
  }[volumeIntensity];

  const responseMultiplier = {
    urgent: 0.3, // Much faster responses
    fast: 0.7, // Faster responses
    normal: 1.0, // Normal response times
    extended: 1.8, // Slower response times
  }[responseSpeed];

  switch (responseType) {
    case 'number':
      if (metricName === 'numberOfTicketsOpen') {
        return Math.floor(randInt(20, 150) * volumeMultiplier * (2 - multiplier));
      }
      if (metricName === 'numberOfTicketsSolved') {
        return Math.floor(randInt(30, 200) * volumeMultiplier * multiplier);
      }
      if (metricName === 'escalatePoint') {
        return Math.floor(randInt(5, 50) * volumeMultiplier * (2 - multiplier));
      }
      if (metricName === 'assignedPoint') {
        return Math.floor(randInt(20, 100) * volumeMultiplier * multiplier);
      }
      if (metricName === 'solvedPoint') {
        return Math.floor(randInt(30, 200) * volumeMultiplier * multiplier);
      }
      if (metricName === 'reopenPoint') {
        return Math.floor(randInt(1, 20) * volumeMultiplier * (2 - multiplier));
      }
      if (metricName === 'publicComments') {
        return Math.floor(randInt(50, 300) * volumeMultiplier * multiplier);
      }
      if (metricName === 'privateComments') {
        return Math.floor(randInt(20, 150) * volumeMultiplier * multiplier);
      }
      if (metricName === 'inboundVolumeAndForecast') {
        // Keep inbound volume lower and more realistic
        return Math.floor(randInt(15, 120) * volumeMultiplier * multiplier);
      }
      return randInt(10, 100);

    case 'percentage':
      if (metricName === 'resolutionRate') {
        return Math.round(randInt(70, 95) * multiplier);
      }
      if (metricName === 'reopenRate') {
        // Ensure reopenRate stays within reasonable percentage bounds (1-15%)
        const baseRate = randInt(1, 15);
        return Math.max(1, Math.min(15, Math.round(baseRate * (2 - multiplier))));
      }
      return Math.round(randInt(60, 95) * multiplier);

    case 'time':
      if (metricName === 'firstResponseTime' || metricName === 'medianFirstResponseTime') {
        return Math.floor(randInt(2, 30) * responseMultiplier * (2 - multiplier)); // minutes
      }
      if (metricName === 'firstAssignTime') {
        return Math.floor(randInt(1, 15) * responseMultiplier * (2 - multiplier)); // minutes
      }
      if (metricName === 'firstSolvedTime') {
        return Math.floor(randInt(10, 180) * responseMultiplier * (2 - multiplier)); // minutes
      }
      if (metricName === 'averageResolutionTime') {
        return Math.floor(randInt(30, 240) * responseMultiplier * (2 - multiplier)); // minutes
      }
      if (metricName === 'averageEscalationTime') {
        return Math.floor(randInt(60, 480) * responseMultiplier * (2 - multiplier)); // minutes
      }
      if (metricName === 'firstResponseTimeAfterAssignment') {
        return Math.floor(randInt(5, 60) * responseMultiplier * (2 - multiplier)); // minutes
      }
      return Math.floor(randInt(5, 120) * responseMultiplier * (2 - multiplier));

    default:
      return randInt(1, 100);
  }
};

export const generateWidgetData = (widgetId: string, widget: any, metric: any, dashboardConfig: DashboardConfig) => {
  const { type: widgetType, metricId } = widget;
  const { responseType } = metric;

  // Generate the base value using the existing function
  const { performanceLevel, volumeIntensity, responseSpeed } = dashboardConfig;
  const value = generateDashboardMetricValue(metricId, performanceLevel, responseType, volumeIntensity, responseSpeed);

  switch (widgetType) {
    case 'value':
    case 'goalCompact':
    case 'goalDonut':
      return {
        data: { value },
        widgetId,
        success: true,
        completedAt: Math.floor(Date.now() / 1000),
        timezone: 'Pacific/Auckland',
      };

    case 'chart':
      // Generate time series data for charts
      const values: Record<string, [number | null, number]> = {};
      const total = [0, 0];

      // Generate 96 data points (15-minute intervals for 24 hours)
      for (let i = 95; i >= 0; i--) {
        const timestamp = Math.floor((Date.now() - i * 15 * 60 * 1000) / 1000);

        // Special handling for inboundVolumeAndForecast to generate realistic data
        if (metricId === 'inboundVolumeAndForecast') {
          // Historical data (past 64 intervals, about 16 hours)
          const actualValue = i < 64 ? Math.floor(value * (0.7 + Math.random() * 0.6)) : null;
          // Forecast data (realistic volume forecast based on historical trends)
          const forecastValue = Math.floor(value * (0.8 + Math.random() * 0.4));

          values[timestamp] = [actualValue, forecastValue];

          if (actualValue !== null) {
            total[0] += actualValue;
          }
          total[1] += forecastValue;
        } else {
          // Default behavior for other metrics
          const actualValue = i < 32 ? value + randInt(-value * 0.3, value * 0.3) : null; // Past data
          const forecastValue = Number((0.4 + Math.random() * 0.5).toFixed(1)); // Forecast between 0.4-0.9

          values[timestamp] = [actualValue, forecastValue];

          if (actualValue !== null) {
            total[0] += actualValue;
          }
          total[1] += forecastValue;
        }
      }

      return {
        data: {
          values,
          total: [Math.floor(total[0]), Number(total[1].toFixed(1))],
        },
        widgetId,
        success: true,
        completedAt: Math.floor(Date.now() / 1000),
        timezone: 'Pacific/Auckland',
      };

    default:
      return {
        data: { value },
        widgetId,
        success: true,
        completedAt: Math.floor(Date.now() / 1000),
        timezone: 'Pacific/Auckland',
      };
  }
};
