package com.carbon.backend.repository;

import com.carbon.backend.model.SupportFAQ;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportFAQRepository extends JpaRepository<SupportFAQ, Long> {
    List<SupportFAQ> findAllByOrderByDisplayOrderAsc();
}
