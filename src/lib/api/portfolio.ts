import { apiFetch } from "./client";
import type { GoalStatus } from "./goals";
import type { SprintStatus } from "./sprints";

export type PortfolioBoardHealth = {
  boardId: string;
  boardName: string;
  cardCount: number;
  overdue: number;
  wip: number;
  blocked: number;
};

export type PortfolioSprint = {
  id: string;
  name: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  cardCount: number;
};

export type PortfolioGoal = {
  id: string;
  name: string;
  status: GoalStatus;
  keyResults: {
    id: string;
    title: string;
    targetNumber: number;
    currentNumber: number;
  }[];
};

export type Portfolio = {
  workspaceId: string;
  boards: PortfolioBoardHealth[];
  sprints: PortfolioSprint[];
  goals: PortfolioGoal[];
};

export const portfolioApi = {
  get(workspaceId: string) {
    return apiFetch<Portfolio>(`/workspaces/${workspaceId}/portfolio`);
  },
};
