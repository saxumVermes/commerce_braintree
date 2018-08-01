<?php

namespace Drupal\commerce_braintree_test\EventSubscriber;

use Drupal\commerce_braintree\Event\BraintreeEvents;
use Drupal\commerce_braintree\Event\TransactionSaleRequestEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class TransactionSaleRequestEventSubscriber implements EventSubscriberInterface {

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    return [
      BraintreeEvents::TRANSACTION_SALE_REQUEST => ['alterTransactionData', -100],
    ];
  }

  public function alterTransactionData(TransactionSaleRequestEvent $event) {
    $transactionData = $event->getTransactionData();

    $order = $event->getPayment()->getOrder();
    /** @var \Drupal\profile\Entity\ProfileInterface $billingProfile */
    $billingProfile = $order->getBillingProfile();

    if ($billingProfile->hasField('address')) {
      /** @var \Drupal\address\AddressInterface $billingAddress */
      $billingAddress = $billingProfile->get('address')->first();

      $transactionData += [
        'shipping' => [
          'firstName' => $billingAddress->getGivenName(),
          'lastName' => $billingAddress->getFamilyName(),
          'streetAddress' => $billingAddress->getAddressLine1(),
          'postalCode' => $billingAddress->getPostalCode(),
        ],
      ];
      $event->setTransactionData($transactionData);
    }
  }

}
