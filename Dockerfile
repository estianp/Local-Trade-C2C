FROM php:8.0-apache

RUN docker-php-ext-install mysqli pdo pdo_mysql

WORKDIR /var/www/html

COPY public /var/www/html
COPY api /var/www/html/api

RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

RUN mkdir -p /var/www/html/uploads && chown www-data:www-data /var/www/html/uploads && chmod 777 /var/www/html/uploads

RUN mkdir -p /var/lib/php/sessions && chown www-data:www-data /var/lib/php/sessions && chmod 777 /var/lib/php/sessions

RUN a2enmod rewrite

CMD ["apache2-foreground"]

