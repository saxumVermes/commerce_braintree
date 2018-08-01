<?php

namespace Drupal\commerce_braintree\Event;

/**
 * Defines events for Braintree module.
 */
final class BraintreeEvents {

  /**
   * Name of the event fired when performing transaction sale request.
   *
   * @Event
   */
  const TRANSACTION_SALE_REQUEST = 'commerce_braintree.transaction_sale_request';

}
