/**
 * @file
 * Defines behaviors for the Braintree payment method form.
 */

(function ($, Drupal, drupalSettings, braintree) {

  'use strict';

  /**
   * Attaches the commerceBraintreeForm behavior.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the commerceBraintreeForm behavior.
   *
   * @see Drupal.commerceBraintree
   */
  Drupal.behaviors.commerceBraintreeForm = {
    attach: function (context) {
      var $form = $('.braintree-form', context).closest('form').once('braintree-attach');
      if ($form.length === 0) {
        return;
      }

      var waitForSdk = setInterval(function () {
        if (typeof braintree !== 'undefined') {
          var commerceBraintree = new Drupal.commerceBraintree($form, drupalSettings.commerceBraintree);
          $form.data('braintree', commerceBraintree);
          clearInterval(waitForSdk);
        }
      }, 100);
    },
    detach: function (context, settings, trigger) {
      // Detaching on the wrong trigger will clear the Braintree form
      // on #ajax (after changing the address country, for example).
      if (trigger !== 'unload') {
        return;
      }
      var $form = $('.braintree-form', context).closest('form');
      if ($form.length === 0) {
        return;
      }

      var commerceBraintree = $form.data('braintree');
      commerceBraintree.integration.teardown();
      $form.removeData('braintree');
      $form.removeOnce('braintree-attach');
      $form.off('submit.braintreeSubmit');
    }
  };

  /**
   * Wraps the Braintree object with Commerce-specific logic.
   *
   * @constructor
   */
  Drupal.commerceBraintree = function ($form, settings) {
    var $submit = $form.find('input.button--primary');
    var that = this;

    braintree.client.create({
      authorization: settings.clientToken
    }, function (clientError, clientInstance) {
      if (clientError) {
        console.error(clientError);
        return;
      }

      braintree.hostedFields.create({
        client: clientInstance,
        fields: settings.hostedFields
      }, function (hostedFieldsError, hostedFieldsInstance) {
        that.integration = hostedFieldsInstance;
        if (hostedFieldsError) {
          console.error(hostedFieldsError);
          return;
        }

        $submit.prop('disabled', false);

        $form.on('submit.braintreeSubmit', function (event, options) {
          options = options || {};
          if (options.tokenized) {
            // Tokenization complete, allow the form to submit.
            return;
          }

          event.preventDefault();
          $('.messages--error', $form).remove();

          hostedFieldsInstance.tokenize(function (tokenizeError, payload) {
            if (tokenizeError) {
              console.log(tokenizeError);
              var message = that.errorMsg(tokenizeError);
              // Show the message above the form.
              $form.prepend(Drupal.theme('commerceBraintreeError', message));
              return;
            }

            $('.braintree-nonce', $form).val(payload.nonce);
            $('.braintree-card-type', $form).val(payload.details.cardType);
            $('.braintree-last2', $form).val(payload.details.lastTwo);
            $form.trigger('submit', { 'tokenized' : true });
          });
        });
      });
    });

    return this;
  };


  Drupal.commerceBraintree.prototype.errorMsg = function(tokenizeError) {
    var message;

    switch (tokenizeError.code) {
      case 'HOSTED_FIELDS_FIELDS_EMPTY':
        message = Drupal.t('Please enter your credit card details.');
        break;

      case 'HOSTED_FIELDS_FIELDS_INVALID':
        var fieldName = '';
        var fields = tokenizeError.details.invalidFieldKeys;
        if (fields.length > 0) {
          if (fields.length > 1) {
            var last = fields.pop();
            fieldName = fields.join(', ');
            fieldName += ' and ' + Drupal.t(last);
            message = Drupal.t('The @fields you entered are invalid.', {'@fields': fieldName});
          }
          else {
            fieldName = fields.pop();
            message = Drupal.t('The @field you entered is invalid.', {'@field': fieldName});
          }
        }
        else {
          message = Drupal.t('The payment details you entered are invalid.');
        }

        message += ' ' + Drupal.t('Please check your details and try again.');
        break;

      case 'HOSTED_FIELDS_TOKENIZATION_CVV_VERIFICATION_FAILED':
        message = Drupal.t('The CVV you entered is invalid.');
        message += ' ' + Drupal.t('Please check your details and try again.');
        break;

      case 'HOSTED_FIELDS_FAILED_TOKENIZATION':
        message = Drupal.t('An error occurred while contacting the payment gateway.');
        message += ' ' + Drupal.t('Please check your details and try again.');
        break;

      case 'HOSTED_FIELDS_TOKENIZATION_NETWORK_ERROR':
        message = Drupal.t('Could not connect to the payment gateway.');
        break;

      default:
        message = tokenizeError.message;
    }

    return message;
  };

  $.extend(Drupal.theme, /** @lends Drupal.theme */{
    commerceBraintreeError: function (message) {
      return $('<div role="alert">' +
        '<div class="messages messages--error">' + message + '</div>' +
        '</div>'
      );
    }
  });

})(jQuery, Drupal, drupalSettings, window.braintree);
