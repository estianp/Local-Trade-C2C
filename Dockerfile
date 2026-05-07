FROM php:8.0-apache

RUN docker-php-ext-install mysqli pdo pdo_mysql

WORKDIR /var/www/html

COPY public /var/www/html
COPY api /var/www/html/api

RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

RUN a2enmod rewrite

RUN echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/docker.conf && \
a2enconf docker

