package com.cts.controller;

import com.cts.model.Transaction;
import com.cts.model.Transaction.TransactionStatus;
import com.cts.model.Transaction.PaymentMethod;
import com.cts.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // POST /api/transactions
    // Body: { "user": {"userId": 1}, "session": {"sessionId": 2}, "amount": 499.00, "paymentMethod": "UPI" }
    @PostMapping
    public ResponseEntity<Transaction> create(@Valid @RequestBody Transaction txn) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.createTransaction(txn));
    }

    // GET /api/transactions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(transactionService.getById(id));
    }

    // GET /api/transactions/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(transactionService.getByUser(userId));
    }

    // GET /api/transactions/session/{sessionId}
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<Transaction>> getBySession(@PathVariable Integer sessionId) {
        return ResponseEntity.ok(transactionService.getBySession(sessionId));
    }

    // GET /api/transactions/status?status=Success
    @GetMapping("/status")
    public ResponseEntity<List<Transaction>> getByStatus(@RequestParam TransactionStatus status) {
        return ResponseEntity.ok(transactionService.getByStatus(status));
    }

    // GET /api/transactions/user/{userId}/status?status=Pending
    @GetMapping("/user/{userId}/status")
    public ResponseEntity<List<Transaction>> getByUserAndStatus(
            @PathVariable Integer userId,
            @RequestParam TransactionStatus status) {
        return ResponseEntity.ok(transactionService.getByUserAndStatus(userId, status));
    }

    // GET /api/transactions/method?method=UPI
    @GetMapping("/method")
    public ResponseEntity<List<Transaction>> getByMethod(@RequestParam PaymentMethod method) {
        return ResponseEntity.ok(transactionService.getByPaymentMethod(method));
    }

    // GET /api/transactions/user/{userId}/total
    @GetMapping("/user/{userId}/total")
    public ResponseEntity<BigDecimal> getTotalByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(transactionService.getTotalSuccessfulAmountByUser(userId));
    }

    // PATCH /api/transactions/{id}/status?status=Success
    @PatchMapping("/{id}/status")
    public ResponseEntity<Transaction> updateStatus(
            @PathVariable Integer id,
            @RequestParam TransactionStatus status) {
        return ResponseEntity.ok(transactionService.updateStatus(id, status));
    }

    // DELETE /api/transactions/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}