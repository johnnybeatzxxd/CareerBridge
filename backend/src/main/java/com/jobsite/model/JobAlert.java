package com.jobsite.model;

import java.util.List;

public class JobAlert {
    public long id;
    public long seekerId;
    public String keyword;
    public String location;
    public String jobType;
    public Boolean active;
    public String createdAt;
    public List<Job> matchingJobs;
}
