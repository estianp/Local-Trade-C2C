FROM php:8.0-apache

RUN docker-php-ext-install mysqli pdo pdo_mysql

WORKDIR /var/www/html

COPY public /var/www/html
COPY api /var/www/html/api

RUN mkdir -p /var/www/html/uploads && chmod 777 /var/www/html/uploads

RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

RUN a2enmod rewrite

