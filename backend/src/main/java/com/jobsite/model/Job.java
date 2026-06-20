package com.jobsite.model;

import java.math.BigDecimal;
import java.util.List;

public class Job {
    public long id;
    public long employerId;
    public String employerName;
    public String companyName;
    public String companyEmail;
    public String title;
    public String location;
    public String jobType;
    public String salary;
    public BigDecimal price;
    public List<String> skills;
    public String description;
    public String requirements;
    public String status;
    public boolean filled;
    public String createdAt;
}
