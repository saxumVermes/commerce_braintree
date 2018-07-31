<?php

namespace Drupal\commerce_braintree\Event;

use Drupal\commerce_payment\Entity\PaymentInterface;
use Symfony\Component\EventDispatcher\Event;

class TransactionSaleRequestEvent extends Event {

  /**
   * @var array
   */
  protected $transactionData;

  /**
   * @var \Drupal\commerce_payment\Entity\PaymentInterface
   */
  protected $payment;

  public function __construct(array $transactionData, PaymentInterface $payment) {
    $this->transactionData = $transactionData;
    $this->payment = $payment;
  }

  public function getTransactionData() {
    return $this->transactionData;
  }

  public function getPayment() {
    return $this->payment;
  }

  /**
   * Altering transaction data.
   *
   * @param array $transactionData
   *
   * @return $this
   */
  public function setTransactionData(array $transactionData) {
    $this->transactionData = $transactionData;
    return $this;
  }

}
