package com.jobsite.model;

import java.math.BigDecimal;

public class FinancialTransaction {
    public long id;
    public Long applicationId;
    public Long employerId;
    public long seekerId;
    public String type;
    public BigDecimal amount;
    public String note;
    public String payoutMethod;
    public String payoutAccount;
    public String status;
    public String jobTitle;
    public String employerName;
    public String seekerName;
    public String createdAt;
}
