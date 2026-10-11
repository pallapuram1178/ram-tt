package com.servicedesk.pro.model;

import jakarta.persistence.Embeddable;
import java.time.Instant;

@Embeddable
public class AssetSpecifications {

    private String processor = "";
    private String ram = "";
    private String storage = "";
    private String os = "";
    private String ipAddress = "";
    private String macAddress = "";
    private Instant licenseExpiry;

    public AssetSpecifications() {}

    public AssetSpecifications(String processor, String ram, String storage, String os, String ipAddress, String macAddress, Instant licenseExpiry) {
        this.processor = processor != null ? processor : "";
        this.ram = ram != null ? ram : "";
        this.storage = storage != null ? storage : "";
        this.os = os != null ? os : "";
        this.ipAddress = ipAddress != null ? ipAddress : "";
        this.macAddress = macAddress != null ? macAddress : "";
        this.licenseExpiry = licenseExpiry;
    }

    public String getProcessor() {
        return processor;
    }

    public void setProcessor(String processor) {
        this.processor = processor;
    }

    public String getRam() {
        return ram;
    }

    public void setRam(String ram) {
        this.ram = ram;
    }

    public String getStorage() {
        return storage;
    }

    public void setStorage(String storage) {
        this.storage = storage;
    }

    public String getOs() {
        return os;
    }

    public void setOs(String os) {
        this.os = os;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getMacAddress() {
        return macAddress;
    }

    public void setMacAddress(String macAddress) {
        this.macAddress = macAddress;
    }

    public Instant getLicenseExpiry() {
        return licenseExpiry;
    }

    public void setLicenseExpiry(Instant licenseExpiry) {
        this.licenseExpiry = licenseExpiry;
    }
}
