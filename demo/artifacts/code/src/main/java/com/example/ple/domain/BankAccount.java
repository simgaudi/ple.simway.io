package com.example.ple.domain;

import java.math.BigDecimal;
import com.example.ple.domain.annotations.AggregateRoot;

@AggregateRoot
public class BankAccount {
    private String accountNumber;
    private String currency;
    private BigDecimal balance;
}
