<?php
session_start();
require_once 'db.php';

// Show transaction message if set
$transactionMsg = null;
if (isset($_SESSION['transaction_msg'])) {
    $transactionMsg = $_SESSION['transaction_msg'];
    unset($_SESSION['transaction_msg']);
}

// Get the latest paid order for this user
$user_id = $_SESSION['user_id'] ?? null;
$order = null;
if ($user_id) {
    $stmt = $conn->prepare("SELECT id, created_at, total, items FROM orders WHERE user_id=? AND status='paid' ORDER BY created_at DESC LIMIT 1");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $order = $res->fetch_assoc();
    if ($order) {
        $order['items'] = json_decode($order['items'], true);
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Successful</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body class="bg-light">

  <div class="container mt-5">
    <?php if ($transactionMsg) echo $transactionMsg; ?>

    <div class="text-center mb-4">
      <img src="payment-success.jpg" class="img-fluid mb-3" alt="Payment Success" style="max-width: 300px;" />
      <div class="card shadow">
        <div class="card-body text-white bg-success">
          <h5 class="card-title">Dear Customer,</h5>
          <p class="card-text">
            Your payment has been successfully processed. Thank you for shopping with us.
          </p>
        </div>
      </div>
    </div>

    <?php if ($order): ?>
      <div class="card shadow mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Order Details</h5>
        </div>
        <div class="card-body">
          <p><strong>Order ID:</strong> <?= htmlspecialchars($order['id']) ?></p>
          <p><strong>Date:</strong> <?= htmlspecialchars($order['created_at']) ?></p>
          <p><strong>Total:</strong> Rs. <?= number_format($order['total'], 2) ?></p>

          <table class="table table-striped mt-3">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($order['items'] as $item): ?>
                <tr>
                  <td><?= htmlspecialchars($item['product_name']) ?></td>
                  <td><?= htmlspecialchars($item['quantity']) ?></td>
                  <td><?= number_format($item['product_price'], 2) ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
        <div class="card-footer text-center">
          <a href="cart.html" class="btn btn-primary">Back to Cart</a>
          <a href="orders.html" class="btn btn-secondary">View My Orders</a>
        </div>
      </div>
    <?php endif; ?>
  </div>

</body>
</html>