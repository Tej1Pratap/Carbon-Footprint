package com.carbon.backend.event;

import com.carbon.backend.model.Goal;
import com.carbon.backend.model.User;
import org.springframework.context.ApplicationEvent;

public class GoalAchievedEvent extends ApplicationEvent {
    private final User user;
    private final Goal goal;
    private final double kgSaved;

    public GoalAchievedEvent(Object source, User user, Goal goal, double kgSaved) {
        super(source);
        this.user = user;
        this.goal = goal;
        this.kgSaved = kgSaved;
    }

    public User getUser() { return user; }
    public Goal getGoal() { return goal; }
    public double getKgSaved() { return kgSaved; }
}
