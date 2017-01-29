# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  config.vm.define "es_cluster_1" do |es_cluster_1|
      es_cluster_1.vm.box = "ubuntu/trusty64"

      es_cluster_1.vm.box_check_update = false

      es_cluster_1.vm.network "private_network", ip: "192.168.33.10"

      es_cluster_1.vm.provider "virtualbox" do |vb|
        vb.memory = "512"
      end

      es_cluster_1.vm.provision "shell", inline: <<-SHELL
        curl -s https://packagecloud.io/install/repositories/EventStore/EventStore-OSS/script.deb.sh | sudo bash
        sudo apt install EventStore-OSS
        sudo echo "---" > /etc/eventstore/eventstore.conf
        sudo echo "RunProjections: None" >> /etc/eventstore/eventstore.conf
        sudo echo "IntIp: 192.168.33.10" >> /etc/eventstore/eventstore.conf
        sudo echo "ExtIp: 192.168.33.10" >> /etc/eventstore/eventstore.conf
        sudo echo "ClusterSize: 3" >> /etc/eventstore/eventstore.conf
        sudo echo "DiscoverViaDns: False" >> /etc/eventstore/eventstore.conf
        sudo echo "GossipSeed: ['192.168.33.11:2112','192.168.33.12:2112']" >> /etc/eventstore/eventstore.conf
        sudo service eventstore start
      SHELL
  end

  config.vm.define "es_cluster_2" do |es_cluster_2|
    es_cluster_2.vm.box = "ubuntu/trusty64"

    es_cluster_2.vm.box_check_update = false

    es_cluster_2.vm.network "private_network", ip: "192.168.33.11"

    es_cluster_2.vm.provider "virtualbox" do |vb|
      vb.memory = "512"
    end

    es_cluster_2.vm.provision "shell", inline: <<-SHELL
      curl -s https://packagecloud.io/install/repositories/EventStore/EventStore-OSS/script.deb.sh | sudo bash
      sudo apt install EventStore-OSS
      sudo echo "---" > /etc/eventstore/eventstore.conf
      sudo echo "RunProjections: None" >> /etc/eventstore/eventstore.conf
      sudo echo "IntIp: 192.168.33.11" >> /etc/eventstore/eventstore.conf
      sudo echo "ExtIp: 192.168.33.11" >> /etc/eventstore/eventstore.conf
      sudo echo "ClusterSize: 3" >> /etc/eventstore/eventstore.conf
      sudo echo "DiscoverViaDns: False" >> /etc/eventstore/eventstore.conf
      sudo echo "GossipSeed: ['192.168.33.10:2112','192.168.33.12:2112']" >> /etc/eventstore/eventstore.conf
      sudo service eventstore start
    SHELL
  end

  config.vm.define "es_cluster_3" do |es_cluster_3|
    es_cluster_3.vm.box = "ubuntu/trusty64"

    es_cluster_3.vm.box_check_update = false

    es_cluster_3.vm.network "private_network", ip: "192.168.33.12"

    es_cluster_3.vm.provider "virtualbox" do |vb|
      vb.memory = "512"
    end

    es_cluster_3.vm.provision "shell", inline: <<-SHELL
      curl -s https://packagecloud.io/install/repositories/EventStore/EventStore-OSS/script.deb.sh | sudo bash
      sudo apt install EventStore-OSS
      sudo echo "---" > /etc/eventstore/eventstore.conf
      sudo echo "RunProjections: None" >> /etc/eventstore/eventstore.conf
      sudo echo "IntIp: 192.168.33.12" >> /etc/eventstore/eventstore.conf
      sudo echo "ExtIp: 192.168.33.12" >> /etc/eventstore/eventstore.conf
      sudo echo "ClusterSize: 3" >> /etc/eventstore/eventstore.conf
      sudo echo "DiscoverViaDns: False" >> /etc/eventstore/eventstore.conf
      sudo echo "GossipSeed: ['192.168.33.10:2112','192.168.33.11:2112']" >> /etc/eventstore/eventstore.conf
      sudo service eventstore start
    SHELL
  end
end
