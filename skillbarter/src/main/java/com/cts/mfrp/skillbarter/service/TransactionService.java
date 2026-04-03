package com.cts.service;

import com.cts.model.Session;
import com.cts.model.Transaction;
import com.cts.model.Transaction.TransactionStatus;
import com.cts.model.Transaction.PaymentMethod;
import com.cts.model.User;
import com.cts.repo.SessionRepo;
import com.cts.repo.TransactionRepo;
import com.cts.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepo transactionRepo;
    private final UserRepo userRepo;
    private final SessionRepo sessionRepo;

    public Transaction createTransaction(Transaction txn) {
        User user = userRepo.findById(txn.getUser().getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Session session = sessionRepo.findById(txn.getSession().getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));
        txn.setUser(user);
        txn.setSession(session);
        txn.setStatus(TransactionStatus.Pending);
        return transactionRepo.save(txn);
    }

    @Transactional(readOnly = true)
    public Transaction getById(Integer id) {
        return findOrThrow(id);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getByUser(Integer userId) {
        return transactionRepo.findByUser_UserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getBySession(Integer sessionId) {
        return transactionRepo.findBySession_SessionId(sessionId);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getByStatus(TransactionStatus status) {
        return transactionRepo.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getByUserAndStatus(Integer userId, TransactionStatus status) {
        return transactionRepo.findByUser_UserIdAndStatus(userId, status);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getByPaymentMethod(PaymentMethod method) {
        return transactionRepo.findByPaymentMethod(method);
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalSuccessfulAmountByUser(Integer userId) {
        BigDecimal total = transactionRepo.sumSuccessfulAmountByUser(userId);
        return total != null ? total : BigDecimal.ZERO;
    }

    public Transaction updateStatus(Integer id, TransactionStatus status) {
        Transaction txn = findOrThrow(id);
        txn.setStatus(status);
        return transactionRepo.save(txn);
    }

    public void deleteTransaction(Integer id) {
        if (!transactionRepo.existsById(id))
            throw new RuntimeException("Transaction not found: " + id);
        transactionRepo.deleteById(id);
    }

    private Transaction findOrThrow(Integer id) {
        return transactionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + id));
    }
}