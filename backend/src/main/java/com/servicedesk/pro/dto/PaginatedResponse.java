package com.servicedesk.pro.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaginatedResponse<T> {

    private boolean success = true;
    private int count;
    private long total;
    private int totalPages;
    private int currentPage;
    private List<T> data;
    private Object categoryCounts;

    public PaginatedResponse() {}

    public PaginatedResponse(int count, long total, int totalPages, int currentPage, List<T> data) {
        this.success = true;
        this.count = count;
        this.total = total;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.data = data;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public List<T> getData() {
        return data;
    }

    public void setData(List<T> data) {
        this.data = data;
    }

    public Object getCategoryCounts() {
        return categoryCounts;
    }

    public void setCategoryCounts(Object categoryCounts) {
        this.categoryCounts = categoryCounts;
    }
}
