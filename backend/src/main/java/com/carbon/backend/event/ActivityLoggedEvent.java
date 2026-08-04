package com.carbon.backend.event;

import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.User;
import org.springframework.context.ApplicationEvent;

public class ActivityLoggedEvent extends ApplicationEvent {
    private final User user;
    private final ActivityLog activityLog;

    public ActivityLoggedEvent(Object source, User user, ActivityLog activityLog) {
        super(source);
        this.user = user;
        this.activityLog = activityLog;
    }

    public User getUser() { return user; }
    public ActivityLog getActivityLog() { return activityLog; }
}
