package com.cts.mfrp.skillbarter.repo;

import com.cts.mfrp.skillbarter.model.Transaction;
import com.cts.mfrp.skillbarter.model.Transaction.TransactionStatus;
import com.cts.mfrp.skillbarter.model.Transaction.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TransactionRepo extends JpaRepository<Transaction, Integer> {

    List<Transaction> findByUser_UserId(Integer userId);

    List<Transaction> findBySession_SessionId(Integer sessionId);

    List<Transaction> findByStatus(TransactionStatus status);

    List<Transaction> findByUser_UserIdAndStatus(Integer userId, TransactionStatus status);

    List<Transaction> findByPaymentMethod(PaymentMethod paymentMethod);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.userId = :userId AND t.status = 'Success'")
    BigDecimal sumSuccessfulAmountByUser(@Param("userId") Integer userId);
}