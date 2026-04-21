package com.jobsite.model;

import java.math.BigDecimal;
import java.util.List;

public class WalletSummary {
    public BigDecimal availableBalance;
    public BigDecimal totalEarned;
    public BigDecimal totalWithdrawn;
    public List<FinancialTransaction> transactions;
}
